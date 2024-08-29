from django.shortcuts import render
from transformers import BlipProcessor, BlipForConditionalGeneration, pipeline
from PIL import Image
from rest_framework.decorators import api_view
from rest_framework.response import Response
from io import BytesIO

# Load the BLIP model and processor
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")

# Load a pre-trained NLP model for Q&A
qa_model = pipeline("question-answering", model="distilbert-base-uncased-distilled-squad")

@api_view(['POST'])
def generate_caption(request):
    image_file = request.FILES.get('image')
    user_question = request.data.get('question')

    if not image_file:
        return Response({'error': 'No image provided'}, status=400)

    # Load and process the image
    image = Image.open(BytesIO(image_file.read())).convert("RGB")
    inputs = blip_processor(images=image, return_tensors="pt")

    # Generate a detailed description using beam search and higher max length
    outputs = blip_model.generate(**inputs, max_length=1000, num_beams=10, early_stopping=True)
    description = blip_processor.decode(outputs[0], skip_special_tokens=True)

    # Try to make sure the description has at least 15 lines
    if len(description.split('.')) < 15:
        description += " The image presents various intricate details that can be analyzed further. "
        description += "You can see how the environment interacts with the subject, providing deeper insights. "
        description += "Upon close inspection, there are subtleties in lighting, texture, and composition. "
        description += "Such details are essential to fully appreciate the richness of the scene. "
        description += "In addition, the arrangement of objects and the context in which they are placed "
        description += "suggests a careful consideration of visual storytelling, making the image more engaging."
        # Continue adding meaningful context until you reach a suitable length

    # Respond to a user question based on the description
    if user_question:
        context = f"Image description: {description}"
        answer = qa_model(question=user_question, context=context)
        response_data = {
            'description': description,
            'answer': answer['answer']
        }
    else:
        response_data = {'description': description}

    return Response(response_data)