# Interactive ML Model for Income Band and Default Risk Prediction
# Updated with exact 20 features as specified

import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import warnings

warnings.filterwarnings('ignore')


class InteractiveMLModel:
    def __init__(self):
        """Initialize the interactive ML model with correct 20 feature definitions"""

        # Exact 20 features as specified by user
        self.feature_definitions = {
            'region': {'type': 'categorical', 'options': ['Rural', 'Urban']},
            'household_size': {'type': 'numeric', 'range': (1, 100)},
            'num_loans': {'type': 'numeric', 'range': (0, 100)},
            'avg_loan_amount': {'type': 'numeric', 'range': (0, 200000)},
            'on_time_ratio': {'type': 'numeric', 'range': (0.0, 1.0)},
            'avg_days_late': {'type': 'numeric', 'range': (0, 1000)},
            'max_dpd': {'type': 'numeric', 'range': (0, 2000)},
            'num_defaults': {'type': 'numeric', 'range': (0, 1000)},
            'avg_kwh_30d': {'type': 'numeric', 'range': (0, 1000)},
            'var_kwh_30d': {'type': 'numeric', 'range': (0, 1000)},
            'seasonality_index': {'type': 'numeric', 'range': (0.0, 10)},
            'avg_recharge_amount': {'type': 'numeric', 'range': (0, 2000)},
            'recharge_freq_30d': {'type': 'numeric', 'range': (0, 30)},
            'last_recharge_days': {'type': 'numeric', 'range': (0, 100)},
            'bill_on_time_ratio': {'type': 'numeric', 'range': (0.00, 2.0)},
            'avg_bill_delay': {'type': 'numeric', 'range': (0, 1000)},
            'avg_bill_amount': {'type': 'numeric', 'range': (0, 100000)},
            'education_level': {'type': 'categorical', 'options': ['Illiterate', 'Primary', 'Secondary', 'Graduate']},
            'occupation': {'type': 'categorical',
                           'options': ['Farmer','Shopkeeper','Laborer','Service','Others','DailyWage','SmallBusiness']},
            'asset_score': {'type': 'numeric', 'range': (0, 10000)},
        }

        # Initialize encoders and models
        self.region_encoder = LabelEncoder()
        self.education_encoder = LabelEncoder()
        self.occupation_encoder = LabelEncoder()
        self.scaler = StandardScaler()

        # Fit encoders with expected values
        self.region_encoder.fit(['Rural', 'Urban'])
        self.education_encoder.fit(['Illiterate', 'Primary', 'Secondary', 'Graduate'])
        self.occupation_encoder.fit(['Farmer','Shopkeeper','Laborer','Service','Others','DailyWage','SmallBusiness'])

        # Create and train models (load your trained models here)
        self.default_model = None
        self.income_model = None
        self.income_encoder = LabelEncoder()
        self.income_encoder.fit(['Very Low', 'Low', 'Medium', 'High'])

        # Model training status
        self.models_trained = False

        print("Interactive ML Model initialized with 20 features!")
        print("Features: region, household_size, num_loans, avg_loan_amount, on_time_ratio,")
        print("         avg_days_late, max_dpd, num_defaults, avg_kwh_30d, var_kwh_30d,")
        print("         seasonality_index, avg_recharge_amount, recharge_freq_30d, last_recharge_days,")
        print("         bill_on_time_ratio, avg_bill_delay, avg_bill_amount, education_level, occupation, asset_score")

    def load_trained_models(self, default_model_path=None, income_model_path=None, scaler_path=None):
        """Load your trained models from saved files"""
        try:
            if default_model_path:
                self.default_model = joblib.load(default_model_path)
                print(f"✅ Default risk model loaded from {default_model_path}")

            if income_model_path:
                self.income_model = joblib.load(income_model_path)
                print(f"✅ Income band model loaded from {income_model_path}")

            if scaler_path:
                self.scaler = joblib.load(scaler_path)
                print(f"✅ Scaler loaded from {scaler_path}")

            if self.default_model and self.income_model:
                self.models_trained = True
                print("✅ All models loaded successfully!")

        except Exception as e:
            print(f"❌ Error loading models: {e}")
            print("🔄 Will use demonstration models instead")

    def validate_input(self, user_input):
        """Validate user input against feature definitions"""
        errors = []

        for feature, definition in self.feature_definitions.items():
            if feature not in user_input:
                errors.append(f"Missing required feature: {feature}")
                continue

            value = user_input[feature]

            if definition['type'] == 'categorical':
                if value not in definition['options']:
                    errors.append(f"{feature}: must be one of {definition['options']}, got '{value}'")

            elif definition['type'] == 'numeric':
                try:
                    num_val = float(value)
                    min_val, max_val = definition['range']
                    if not (min_val <= num_val <= max_val):
                        errors.append(f"{feature}: must be between {min_val} and {max_val}, got {num_val}")
                except (ValueError, TypeError):
                    errors.append(f"{feature}: must be a number, got '{value}'")

        return errors

    def preprocess_input(self, user_input):
        """Preprocess user input for model prediction"""

        # Create a copy to avoid modifying original
        processed = user_input.copy()

        # Encode categorical variables
        processed['region_encoded'] = self.region_encoder.transform([processed['region']])[0]
        processed['education_encoded'] = self.education_encoder.transform([processed['education_level']])[0]
        processed['occupation_encoded'] = self.occupation_encoder.transform([processed['occupation']])[0]

        # Remove original categorical columns
        del processed['region']
        del processed['education_level']
        del processed['occupation']

        # Create engineered features (based on your notebook)
        processed['loan_per_household'] = processed['avg_loan_amount'] / processed['household_size'] if processed[
                                                                                                            'household_size'] > 0 else 0
        processed['kwh_per_household'] = processed['avg_kwh_30d'] / processed['household_size'] if processed[
                                                                                                       'household_size'] > 0 else 0
        processed['recharge_intensity'] = processed['avg_recharge_amount'] / processed['recharge_freq_30d'] if \
        processed['recharge_freq_30d'] > 0 else 0
        processed['payment_reliability'] = (processed['on_time_ratio'] + processed['bill_on_time_ratio']) / 2
        processed['financial_stability'] = processed['asset_score'] - processed['avg_days_late'] / 10 - processed[
            'num_defaults']

        # Convert to DataFrame with proper feature order (20 base + 5 engineered = 25 total)
        feature_order = [
            'region_encoded', 'household_size', 'num_loans', 'avg_loan_amount', 'on_time_ratio',
            'avg_days_late', 'max_dpd', 'num_defaults', 'avg_kwh_30d', 'var_kwh_30d',
            'seasonality_index', 'avg_recharge_amount', 'recharge_freq_30d', 'last_recharge_days',
            'bill_on_time_ratio', 'avg_bill_delay', 'avg_bill_amount', 'education_encoded',
            'occupation_encoded', 'asset_score', 'loan_per_household', 'kwh_per_household',
            'recharge_intensity', 'payment_reliability', 'financial_stability'
        ]

        # Create feature vector
        feature_vector = []
        for feature in feature_order:
            if feature in processed:
                feature_vector.append(float(processed[feature]))
            else:
                feature_vector.append(0.0)  # Default value for missing engineered features

        return np.array(feature_vector).reshape(1, -1)

    def create_sample_data_for_training(self):
        """Create sample data to train demonstration models"""
        # Create synthetic training data based on the patterns from your notebook
        np.random.seed(42)
        n_samples = 1000

        # Generate features with updated list
        data = {
            'region_encoded': np.random.choice([0, 1], n_samples),
            'household_size': np.random.randint(1, 11, n_samples),
            'num_loans': np.random.randint(0, 10, n_samples),
            'avg_loan_amount': np.random.normal(43184, 20000, n_samples).clip(0, 200000),
            'on_time_ratio': np.random.normal(0.75, 0.15, n_samples).clip(0.3, 1.0),
            'avg_days_late': np.random.exponential(5, n_samples).clip(0, 39),
            'max_dpd': np.random.normal(45, 20, n_samples).clip(0, 113),
            'num_defaults': np.random.poisson(0.5, n_samples).clip(0, 5),  # New feature
            'avg_kwh_30d': np.random.normal(136, 80, n_samples).clip(0, 399),
            'var_kwh_30d': np.random.normal(33, 30, n_samples).clip(0, 149),
            'seasonality_index': np.random.normal(1.18, 0.3, n_samples).clip(0.27, 2.02),
            'avg_recharge_amount': np.random.normal(229, 150, n_samples).clip(0, 799),
            'recharge_freq_30d': np.random.poisson(6, n_samples).clip(0, 17),
            'last_recharge_days': np.random.normal(15, 8, n_samples).clip(0, 39),
            'bill_on_time_ratio': np.random.normal(0.72, 0.2, n_samples).clip(0.01, 1.4),
            'avg_bill_delay': np.random.exponential(3, n_samples).clip(0, 16.6),
            'avg_bill_amount': np.random.normal(900, 400, n_samples).clip(0, 3334),
            'education_encoded': np.random.choice([0, 1, 2, 3], n_samples),
            'occupation_encoded': np.random.choice([0, 1, 2, 3, 4, 5], n_samples),
            'asset_score': np.random.poisson(2, n_samples).clip(0, 8),
        }

        # Add engineered features
        data['loan_per_household'] = data['avg_loan_amount'] / np.maximum(data['household_size'], 1)
        data['kwh_per_household'] = data['avg_kwh_30d'] / np.maximum(data['household_size'], 1)
        data['recharge_intensity'] = data['avg_recharge_amount'] / np.maximum(data['recharge_freq_30d'], 1)
        data['payment_reliability'] = (data['on_time_ratio'] + data['bill_on_time_ratio']) / 2
        data['financial_stability'] = data['asset_score'] - data['avg_days_late'] / 10 - data['num_defaults']

        X = pd.DataFrame(data)

        # Create synthetic targets with num_defaults included
        default_risk_score = (
                (1 - data['on_time_ratio']) * 0.25 +
                (data['avg_days_late'] / 39) * 0.25 +
                (data['max_dpd'] / 113) * 0.2 +
                (data['num_defaults'] / 5) * 0.1 +  # Include defaults
                (1 - data['bill_on_time_ratio']) * 0.2
        )
        y_default = (default_risk_score > 0.4).astype(int)

        # Income band (higher income for better education, employment, assets)
        income_score = (
                data['education_encoded'] * 0.25 +
                (data['occupation_encoded'] > 1).astype(int) * 0.25 +
                (data['asset_score'] / 8) * 0.25 +
                (data['avg_bill_amount'] / 3334) * 0.25
        )
        y_income = np.digitize(income_score, bins=[0, 0.25, 0.5, 0.75, 1.0]) - 1
        y_income = np.clip(y_income, 0, 3)

        return X, y_default, y_income

    def train_models(self):
        """Train the demonstration models"""
        if self.models_trained:
            return

        print("Training demonstration models with updated 20-feature dataset...")

        X, y_default, y_income = self.create_sample_data_for_training()

        # Scale features
        X_scaled = self.scaler.fit_transform(X)

        # Train models
        self.default_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.income_model = GradientBoostingClassifier(n_estimators=100, random_state=42)

        self.default_model.fit(X_scaled, y_default)
        self.income_model.fit(X_scaled, y_income)

        self.models_trained = True
        print("Models trained successfully!")

        # Print model performance
        default_acc = self.default_model.score(X_scaled, y_default)
        income_acc = self.income_model.score(X_scaled, y_income)
        print(f"Default Risk Model Training Accuracy: {default_acc:.3f}")
        print(f"Income Band Model Training Accuracy: {income_acc:.3f}")

    def predict(self, user_input):
        """Make predictions for user input"""

        # Validate input
        errors = self.validate_input(user_input)
        if errors:
            return {'success': False, 'errors': errors}

        # Train models if not already done
        if not self.models_trained:
            self.train_models()

        try:
            # Preprocess input
            X = self.preprocess_input(user_input)
            X_scaled = self.scaler.transform(X)

            # Make predictions
            default_prob = self.default_model.predict_proba(X_scaled)[0, 1]  # Probability of default
            income_pred = self.income_model.predict(X_scaled)[0]
            income_probs = self.income_model.predict_proba(X_scaled)[0]

            # Get income band name
            income_bands = ['Very Low', 'Low', 'Medium', 'High']
            predicted_income_band = income_bands[income_pred]

            # Create composite score
            income_score = np.dot(income_probs, [0, 1, 2, 3])  # Weighted sum
            income_score_norm = income_score / 3  # Normalize to 0-1

            # Composite credit score (from your notebook)
            w_risk = 0.7
            w_income = 0.3
            composite_score = w_income * income_score_norm + w_risk * (1 - default_prob)

            # Risk and need categorization
            risk_level = "High Risk" if default_prob > 0.5 else "Low Risk"
            need_level = "High Need" if income_score_norm < 0.5 else "Low Need"
            segment = f"{risk_level} {need_level}"

            return {
                'success': True,
                'predictions': {
                    'default_risk_probability': round(float(default_prob), 4),
                    'default_risk_category': risk_level,
                    'predicted_income_band': predicted_income_band,
                    'income_band_probabilities': {
                        band: round(float(prob), 4)
                        for band, prob in zip(income_bands, income_probs)
                    },
                    'income_score_normalized': round(float(income_score_norm), 4),
                    'composite_credit_score': round(float(composite_score), 4),
                    'customer_segment': segment,
                    'recommendations': self._generate_recommendations(default_prob, income_score_norm, user_input)
                }
            }

        except Exception as e:
            return {'success': False, 'errors': [f"Prediction error: {str(e)}"]}

    def _generate_recommendations(self, default_prob, income_score, user_input):
        """Generate recommendations based on predictions"""
        recommendations = []

        if default_prob > 0.7:
            recommendations.append("HIGH RISK: Consider requiring collateral or co-signer")
            recommendations.append("Implement enhanced monitoring and payment reminders")
        elif default_prob > 0.5:
            recommendations.append("MODERATE RISK: Consider reduced credit limits initially")
            recommendations.append("Offer financial literacy programs")
        else:
            recommendations.append("LOW RISK: Eligible for standard credit terms")

        if income_score < 0.3:
            recommendations.append("Consider micro-lending or smaller loan amounts")
            recommendations.append("Provide financial education resources")
        elif income_score > 0.7:
            recommendations.append("Eligible for premium financial products")
            recommendations.append("Consider cross-selling opportunities")

        if user_input.get('num_defaults', 0) > 0:
            recommendations.append(
                f"Previous defaults ({user_input['num_defaults']}) - Enhanced risk monitoring required")

        if user_input.get('on_time_ratio', 1.0) < 0.6:
            recommendations.append("Focus on payment behavior improvement")

        if user_input.get('asset_score', 0) < 2:
            recommendations.append("Consider asset-building financial products")

        return recommendations


def create_sample_input():
    """Create a sample input with all 20 features for demonstration"""
    return {
        'region': 'Urban',
        'household_size': 4,
        'num_loans': 2,
        'avg_loan_amount': 25000,
        'on_time_ratio': 0.85,
        'avg_days_late': 3,
        'max_dpd': 15,
        'num_defaults': 0,  # New feature
        'avg_kwh_30d': 120,
        'var_kwh_30d': 25,
        'seasonality_index': 1.2,
        'avg_recharge_amount': 200,
        'recharge_freq_30d': 8,
        'last_recharge_days': 5,
        'bill_on_time_ratio': 0.9,
        'avg_bill_delay': 2,
        'avg_bill_amount': 800,
        'education_level': 'Secondary',  # Updated name
        'occupation': 'Service',
        'asset_score': 4
    }


if __name__ == "__main__":
    # Initialize the model
    model = InteractiveMLModel()

    # To load your trained models, uncomment and modify these lines:
    # model.load_trained_models(
    #     default_model_path='best_default_risk_model_multicriteria.pkl',
    #     income_model_path='best_income_band_model.pkl',
    #     scaler_path='scaler_XTrain.pkl'
    # )

    # Demo with sample data
    print("\n🔮 DEMO: Making prediction with sample data")
    sample_input = create_sample_input()

    print("\nSample Customer Profile (20 features):")
    for i, (key, value) in enumerate(sample_input.items(), 1):
        print(f"{i:2d}. {key}: {value}")

    result = model.predict(sample_input)

    if result['success']:
        predictions = result['predictions']
        print(f"\n✅ PREDICTION RESULTS")
        print("=" * 50)
        print(f"🎯 Default Risk: {predictions['default_risk_probability']} ({predictions['default_risk_category']})")
        print(f"💰 Income Band: {predictions['predicted_income_band']}")
        print(f"🏆 Credit Score: {predictions['composite_credit_score']}")
        print(f"📋 Segment: {predictions['customer_segment']}")

        print(f"\n💡 Recommendations:")
        for i, rec in enumerate(predictions['recommendations'], 1):
            print(f"  {i}. {rec}")
    else:
        print("❌ Prediction failed:", result['errors'])

    print(f"\n🎉 Model ready with 20 features!")