import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib

# Load dataset
data = pd.read_csv('medical data.csv')

# Drop unnecessary columns
data.drop(['Name', 'DateOfBirth', 'Gender'], axis=1, inplace=True)

# Handle missing values
for column in ['Symptoms', 'Causes', 'Disease', 'Medicine']:
    data[column].fillna(data[column].mode()[0], inplace=True)

# Label encoding
label_encoders = {}
for column in data.columns:
    le = LabelEncoder()
    data[column] = le.fit_transform(data[column])
    label_encoders[column] = le

# Prepare input (X) and output (y)
X = data[['Symptoms']]
y = data[['Causes', 'Disease', 'Medicine']]

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model for each output column
models = {}
for target in y.columns:
    clf = RandomForestClassifier(random_state=42)
    clf.fit(X_train, y_train[target])
    models[target] = clf
    print(f"Trained Random Forest for {target}")

# Save models and label encoders
joblib.dump(models, 'multi_output_rf_models.pkl')
joblib.dump(label_encoders, 'label_encoders.pkl')
print("Models and encoders saved.")
