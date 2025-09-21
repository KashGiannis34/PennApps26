# SustainaView - AI-Powered Sustainable Room Makeover

**Turn any room into an eco-friendly space effortlessly, with a little help from AI.**

<div align="center">
  <img src="assets/Product_Listings.png" alt="Product Listings" width="200" style="margin: 10px;"/>
  <img src="assets/Sustainable_Vision.png" alt="Sustainable Vision" width="200" style="margin: 10px;"/>
  <img src="assets/Wishlist_UI.png" alt="Wishlist UI" width="200" style="margin: 10px;"/>
</div>
<div align="center">
<img src="assets/Tech_Stack.png" alt="Tech Stack" width="610" style="margin: 10px;"/>
</div>

## Overview

SustainaView is a mobile app that makes sustainable interior design easy and fun. Just snap a photo of your room, and our AI will give you personalized, eco-friendly suggestions, show you what your space could look like after a green makeover, and even break down the costs for you. It’s like having a sustainability expert and designer in your pocket!

<img src="assets/icon.png" alt="icon" width="200"/>

### **Project Members**
- **[Arjun Suryawanshi](https://github.com/arjunsur12)** - Frontend Development and UI/UX Design
- **[Chinmay Govind](https://github.com/chinmaygovind)** - Full-Stack Developer and AI Integration
- **[Akash Sarode](https://github.com/KashGiannis34)** - Backend Architecture and Database Design

---

## Motivation
- Energy Waste & Unsustainable Furniture Choices lead to a Massive Carbon Footprint
- The average person won't know which green tech and furniture is economical
- Existing apps can only do product recommendations, not holistic room-aware suggestions

**Interior design generates 10.5 million tons of waste a year in the US alone.**

Our solution is **SustainaView**, an app that lets you take a photo of your room, and visualizes suggestions for green products. The app uses Gemini and SerpAPI to generate product suggestions, providing green substitutes for items in your room. You can select items you like and _Transform_ your room, using Gemini's Nano Banana model to visualize an image of the room with green products.

# Features
- Product Suggestions with Quick Buy Links
- Product Wishlist and Price Comparisons
- Transformed Room Images & Cloud-saved Portfolio
- Authentication & Sharing Features

---

## Technologies Used

### **Frontend - Mobile Application**
- **React Native** - Cross-platform mobile development framework
- **Expo** - Development platform for universal React applications
- **React Navigation** - Seamless navigation between screens
- **Expo Camera** - Native camera integration for room photography
- **AsyncStorage** - Local data persistence and user session management
- **Custom Components** - Reusable UI components including ImageViewer with zoom functionality


### **Backend - API Server**
- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Web application framework for RESTful API development
- **JWT (JSON Web Tokens)** - Secure user authentication and authorization
- **bcrypt** - Password hashing and security
- **CORS** - Cross-origin resource sharing configuration

**How it works:**
- When you take a photo, the app securely uploads it to AWS S3. Each image gets a unique, private URL, and access is managed with signed URLs for security.
- User accounts, authentication tokens, and all wishlist information are stored in MongoDB Atlas. When you save a wishlist item, the app stores the product info and the S3 image URL in your user document, so your data is always linked to your account and available on any device you log in from.


### **Database and Storage**
- **MongoDB Atlas** - Cloud-hosted NoSQL database for user data and transformations
- **Mongoose** - MongoDB object modeling for Node.js
- **AWS S3** - Scalable cloud storage for room images
- **AWS SDK v3** - Modern AWS service integration with signed URLs
- **Sharp** - High-performance image processing and compression

**How it works:**
- When you snap a room photo, the app uploads it to AWS S3 and gets back a secure URL.
- This S3 URL is then saved in MongoDB, linked to your user profile and any wishlist or transformation you create.
- All your wishlist items, including product details and their associated S3 image URLs, are stored in MongoDB Atlas under your user account.
- User authentication (sign up, login, JWT tokens) is handled by the backend and stored securely in MongoDB, so your data is protected and only accessible to you.

### **AI and Machine Learning**
- **Google Gemini API** - Advanced AI for room analysis and product recommendations
- **Gemini Vision** - Computer vision for intelligent room assessment
- **Natural Language Processing** - Context-aware sustainability suggestions
- **Image Generation** - AI-powered visualization of sustainable transformations

### **External Integrations**
- **SerpAPI** - Real-time product search across multiple e-commerce platforms
- **Google Shopping API** - Product price comparison and availability
- **Quick Search Links** - Integration with Amazon, eBay, and Google to have quick search links for each product

### **Development and Deployment**
- **Git** - Version control and collaborative development
- **npm** - Package management and dependency handling
- **Expo CLI** - Development server and build tools
- **VS Code** - Integrated development environment
- **nGrok** - used API gateway to connect external phone to local express server for development

---

## Why We Deserve to Win

**Sustainability Track**: Direct environmental impact through gamified sustainable interior design, measurable results with sustainability scores, and support for local businesses to reduce shipping emissions.

**Best Use of AI**: Multi-modal AI processing combining computer vision for room analysis with intelligent product recommendations and realistic transformation visualizations.

**Best Use of Computer Vision**: Accurate room recognition, object detection, and sustainability assessment from single photos with quality processing across various lighting conditions.

**Best Design**: Intuitive cross-platform UX with streamlined photo-to-visualization workflow and engaging visual storytelling through before/after comparisons.

**Best Use of Gemini API**: Advanced vision processing for comprehensive room analysis, intelligent recommendations, and scalable integration with robust error handling.

**Best Use of MongoDB Atlas**: Efficient document-based storage with flexible schemas, real-time sync across devices, and cloud-native design with proper authentication workflows.

---

## Key Features

### Core Functionality
- **Room Photography**: High-quality camera integration with guided photo capture
- **AI Analysis**: Comprehensive room assessment with sustainability scoring
- **Product Discovery**: Intelligent eco-friendly product recommendations
- **Visual Transformation**: AI-generated before/after room visualizations
- **Transformation Library**: Save and organize your sustainable makeover ideas
- **User Authentication**: Secure account management with JWT tokens

### Advanced Features
- **Cost Analysis**: Price comparisons across multiple retailers including local options
- **Environmental Impact**: Detailed sustainability metrics and potential savings
- **Cross-Platform**: Native mobile experience on both iOS and Android
- **Cloud Storage**: Secure image storage with AWS S3 and signed URLs
- **Real-Time Updates**: Dynamic product availability and pricing information

---

## What Makes SustainaView Special

1. **Holistic Approach**: Unlike simple product recommendation apps, we provide complete room transformation experiences
2. **Local Integration**: Supporting local businesses and second-hand markets for reduced environmental impact
3. **Visual Innovation**: AI-generated visualizations make sustainable choices tangible and exciting
4. **Educational Value**: Users learn about sustainable materials and their benefits through interactive experiences
5. **Community Focus**: Shareable transformations create a network of sustainability-minded individuals
6. **Actionable Results**: Direct purchasing links and cost breakdowns remove barriers to sustainable choices

---

## Impact and Future Vision

SustainaView represents more than just an app—it's a movement toward accessible, intelligent, and beautiful sustainable living. By combining cutting-edge AI with practical interior design solutions, we're making environmental consciousness both achievable and inspiring for everyone.

**Join us in transforming spaces, one room at a time. **

---

*Built with ❤️ for PennApps 2026*
