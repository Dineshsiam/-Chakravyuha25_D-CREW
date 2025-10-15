import json
import qrcode
import os

# Create folder to save QR codes
os.makedirs("qrcodes", exist_ok=True)

# Load employee data
with open("data/employees.json") as f:
    employees = json.load(f)

# Generate QR code for each employee
for emp in employees:
    # QR code file path
    qr_path = f"qrcodes/emp_{emp['id']}.png"

    # Create QR code object
    qr = qrcode.QRCode(
        version=1,
        box_size=10,
        border=4
    )

    # Encode employee info (ID, name, department)
    qr_data = json.dumps({
        "id": emp["id"],
        "name": emp["name"],
        "department": emp["department"]
    })
    qr.add_data(qr_data)
    qr.make(fit=True)

    # Generate image and save
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(qr_path)

    # Optionally, store QR path in employee JSON
    emp["qr_code"] = qr_path

# Update JSON with QR paths
with open("data/employees.json", "w") as f:
    json.dump(employees, f, indent=4)

print("QR codes generated for all employees! Check the 'qrcodes' folder.")
