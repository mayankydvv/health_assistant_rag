import joblib

# Load label encoders
label_encoders = joblib.load("label_encoders.pkl")

# Extract known symptoms
known_symptoms = list(label_encoders['Symptoms'].classes_)

# Print the top 10 symptoms
print("📋 Speak any of these symptoms:")
for symptom in known_symptoms[:10]:
    print("-", symptom)
