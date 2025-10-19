# Flask Web Server for ML Model
# Save this as: app.py

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import sys
import os

# Import your model (make sure model.py is in same directory)
try:
    from model import InteractiveMLModel
except ImportError:
    print("❌ Error: Cannot import model.py")
    print("Make sure model.py is in the same directory as app.py")
    sys.exit(1)

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Initialize the model
ml_model = InteractiveMLModel()


# Load your trained models (uncomment and update paths)
# ml_model.load_trained_models(
#     default_model_path='best_default_risk_model_multicriteria.pkl',
#     income_model_path='best_income_band_model.pkl',
#     scaler_path='scaler_X_train.pkl'
# )

@app.route('/')
def index():
    """Serve the main HTML page"""
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    """Handle prediction requests from the web interface"""
    try:
        # Get JSON data from the request
        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'errors': ['No data provided']
            }), 400

        # Convert string numbers to appropriate types
        processed_data = {}
        for key, value in data.items():
            if key in ['region', 'education_level', 'occupation']:
                processed_data[key] = str(value)
            else:
                try:
                    # Try to convert to number
                    if '.' in str(value):
                        processed_data[key] = float(value)
                    else:
                        processed_data[key] = int(value)
                except (ValueError, TypeError):
                    processed_data[key] = value

        # Make prediction using your model
        result = ml_model.predict(processed_data)

        return jsonify(result)

    except Exception as e:
        return jsonify({
            'success': False,
            'errors': [f'Server error: {str(e)}']
        }), 500


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_trained': ml_model.models_trained,
        'features_count': len(ml_model.feature_definitions)
    })


if __name__ == '__main__':
    print("🚀 Starting ML Model Web Server...")
    print("📊 Model Features:", len(ml_model.feature_definitions))
    print("🌐 Server will be available at: http://localhost:5000")
    print("💡 Press Ctrl+C to stop the server")

    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
