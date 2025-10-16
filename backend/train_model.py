import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error
import joblib, os

# Load data
data = pd.read_csv("data/production_data.csv")

# Define features and target
X = data[["customer_order", "efficiency", "cycle_time_min", "manpower", "foam_available", "spring_available"]]
y = data["produced"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# Evaluate
pred = model.predict(X_test)
print("R² Score:", r2_score(y_test, pred))
print("MAE:", mean_absolute_error(y_test, pred))

# Save model
os.makedirs("data", exist_ok=True)
joblib.dump(model, "data/model.pkl")
print("✅ Model saved successfully at data/model.pkl")
