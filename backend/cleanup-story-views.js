import mongoose from 'mongoose';
import Story from './models/storyModel.js';
import dotenv from 'dotenv';

dotenv.config();

async function cleanupAllStoryViews() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all active stories
    const stories = await Story.find({
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('author', 'username');
    console.log(`Found ${stories.length} active stories to clean up`);
    
    // Show some details
    for (const story of stories) {
      console.log(`Story ${story._id} by ${story.author?.username}: ${story.views.length} views, expires: ${story.expiresAt}`);
      
      // Show view details
      for (const view of story.views) {
        console.log(`  - View by user: ${view.user}`);
      }
    }

    let cleanedCount = 0;

    for (const story of stories) {
      const originalViewCount = story.views.length;
      const authorId = story.author.toString();
      
      // Remove owner views and duplicates
      const uniqueViews = [];
      const seenUsers = new Set();

      for (const view of story.views) {
        const userId = view.user.toString();
        
        // Skip owner views and duplicate views
        if (userId !== authorId && !seenUsers.has(userId)) {
          uniqueViews.push(view);
          seenUsers.add(userId);
        }
      }

      if (uniqueViews.length !== originalViewCount) {
        story.views = uniqueViews;
        await story.save();
        cleanedCount++;
        console.log(`Cleaned story ${story._id}: ${originalViewCount} -> ${uniqueViews.length} views`);
      }
    }

    console.log(`\nCleanup complete! Cleaned ${cleanedCount} stories.`);
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupAllStoryViews();