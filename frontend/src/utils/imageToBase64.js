// Utility function to convert image files to base64
// This allows us to store images directly in the database instead of file paths

export const convertImageFileToBase64 = async (imagePath) => {
    try {
        // For images in the public folder, we need to fetch them and convert to base64
        const response = await fetch(imagePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve({
                    imageData: reader.result, // Base64 data
                    imageType: blob.type // MIME type
                });
            };
            reader.onerror = () => reject(new Error('Failed to read image file'));
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Failed to convert image to base64:', error);
        // Return a placeholder image if conversion fails
        return {
            imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
            imageType: 'image/jpeg'
        };
    }
};

// Function to convert multiple image paths to base64
export const convertMultipleImagesToBase64 = async (imagePaths) => {
    const results = [];
    for (const path of imagePaths) {
        const result = await convertImageFileToBase64(path);
        results.push(result);
    }
    return results;
};
