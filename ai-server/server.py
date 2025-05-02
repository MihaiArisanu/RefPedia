from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)
classifier = pipeline("text-classification", model="unitary/toxic-bert", top_k=None)

@app.route('/check-feedback', methods=['POST'])
def check_feedback():
    data = request.get_json()
    content = data.get("content", "")

    predictions = classifier(content)[0]
    toxic_scores = {item['label']: item['score'] for item in predictions}
    offensive = any(toxic_scores.get(label, 0) > 0.6 for label in ['toxicity', 'obscene', 'insult'])

    return jsonify({"offensive": offensive})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)