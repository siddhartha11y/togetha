from PIL import Image, ImageDraw
import os

# Create a simple default avatar PNG
def create_default_avatar():
    # Create a 200x200 image with transparent background
    img = Image.new('RGBA', (200, 200), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw background circle
    draw.ellipse([0, 0, 200, 200], fill=(107, 114, 128, 255))  # Gray background
    
    # Draw head circle
    draw.ellipse([75, 50, 125, 100], fill=(156, 163, 175, 255))  # Lighter gray for head
    
    # Draw body (shoulders)
    draw.ellipse([50, 120, 150, 180], fill=(156, 163, 175, 255))  # Body/shoulders
    
    # Save the image
    img.save('backend/public/images/default-avatar.png')
    print("Default avatar PNG created successfully!")

if __name__ == "__main__":
    create_default_avatar()