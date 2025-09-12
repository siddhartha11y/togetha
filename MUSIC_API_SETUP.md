# Music API Setup Guide

This guide will help you set up music APIs to get access to millions of songs from Spotify, YouTube, and Deezer.

## 🎵 Spotify API Setup

### Step 1: Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the details:
   - App Name: "Your App Name"
   - App Description: "Social media app with music integration"
   - Website: `http://localhost:3000`
   - Redirect URI: `http://localhost:3000/callback`
5. Check the boxes for terms of service
6. Click "Create"

### Step 2: Get API Keys

1. In your app dashboard, you'll see:
   - **Client ID** - Copy this
   - **Client Secret** - Click "Show Client Secret" and copy
2. Add these to your `.env` file:
   ```
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   ```

## 🎬 YouTube API Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the YouTube Data API v3:
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click on it and press "Enable"

### Step 2: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. Add to your `.env` file:
   ```
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

## 🎶 Deezer API Setup

### Step 1: Register Application

1. Go to [Deezer Developers](https://developers.deezer.com/)
2. Create an account or log in
3. Go to "My Apps" and click "Create a new application"
4. Fill in the details:
   - Application Name: "Your App Name"
   - Application Domain: `localhost:3000`
   - Description: "Social media app with music"

### Step 2: Get API Key

1. After creating the app, you'll get an Application ID
2. Add to your `.env` file:
   ```
   DEEZER_API_KEY=your_application_id_here
   ```

## 🚀 Features You'll Get

### With Spotify API:

- ✅ 70+ million songs
- ✅ High-quality album covers
- ✅ 30-second previews
- ✅ Artist information
- ✅ Popularity scores
- ✅ Release dates

### With YouTube API:

- ✅ Billions of music videos
- ✅ Full-length previews
- ✅ Music videos and covers
- ✅ Independent artists
- ✅ Remixes and live versions

### With Deezer API:

- ✅ 90+ million songs
- ✅ 30-second previews
- ✅ International music
- ✅ Multiple languages
- ✅ High-quality metadata

## 🔧 Testing Your Setup

1. Add your API keys to the `.env` file
2. Restart your backend server
3. Open the story creator
4. Click on "Music" tab
5. Search for any song - you should see results from all platforms!

## 📝 API Limits

### Spotify:

- **Free Tier**: 100 requests per hour
- **Extended Quota**: Contact Spotify for higher limits

### YouTube:

- **Free Tier**: 10,000 units per day
- **Paid Tier**: Higher quotas available

### Deezer:

- **Free Tier**: No official limits mentioned
- **Rate Limiting**: Reasonable use expected

## 🛡️ Legal Considerations

- ✅ **Previews**: 30-second previews are allowed for all platforms
- ✅ **Metadata**: Song titles, artists, albums are public information
- ✅ **Album Art**: Provided by APIs for app use
- ❌ **Full Songs**: Never download or stream full copyrighted content
- ❌ **Commercial Use**: Check platform terms for commercial usage

## 🔄 Fallback System

Our app includes a fallback system:

1. **Primary**: Try to fetch from APIs
2. **Secondary**: Use sample music database
3. **Offline**: Show cached results

This ensures your app works even if APIs are down or you haven't set up keys yet.

## 🎯 Next Steps

1. Get your API keys from all three platforms
2. Add them to your `.env` file
3. Restart your backend
4. Test the music search functionality
5. Enjoy millions of songs in your stories!

## 🆘 Troubleshooting

### Common Issues:

**"Invalid Client" Error (Spotify)**

- Check your Client ID and Secret are correct
- Ensure no extra spaces in .env file

**"Quota Exceeded" Error (YouTube)**

- You've hit the daily limit
- Wait 24 hours or upgrade your quota

**"Network Error"**

- Check your internet connection
- Verify API endpoints are accessible

**No Results Found**

- Try different search terms
- Check if APIs are responding
- Fallback to sample music should work

Need help? The app will work with sample music even without API keys!
