# Xeno CRM Platform

A comprehensive Mini CRM Platform built for the Xeno SDE Internship Assignment 2025. This platform enables customer segmentation, personalized campaign delivery, and intelligent insights using modern web technologies.

## 🚀 Features

### ✅ Core Features
- **Data Ingestion APIs**: Secure REST APIs for customers and orders data
- **Campaign Creation UI**: Dynamic rule builder for audience segmentation
- **Campaign Delivery & Logging**: Simulated message delivery with real-time tracking
- **Google OAuth Authentication**: Secure user authentication
- **AI Integration**: Natural language to rules conversion and message generation

### 🎯 Key Capabilities

- Flexible audience segmentation with AND/OR logic
- Real-time audience size preview
- AI-powered campaign message suggestions
- Comprehensive delivery analytics
- Responsive design for all devices
- RESTful API with Swagger documentation

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for data fetching
- **React Hook Form** for form management
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Google OAuth 2.0** integration
- **OpenAI API** for AI features
- **Swagger** for API documentation

### Deployment
- **Vercel** for frontend hosting
- **MongoDB Atlas** for database
- **Environment variables** for configuration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas)
- **Git**



# Database
MONGODB_URI=ATLAS_URI

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI API (Optional - for AI features)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# API Configuration
VITE_API_URL=http://localhost:5000/api

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com


#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins:
   - \`http://localhost:5173\` (development)
   - Your production domain
6. Copy Client ID and Secret to .env files

#### OpenAI API Setup (Optional)
1. Create account at [OpenAI](https://platform.openai.com/)
2. Generate API key
3. Add to \`OPENAI_API_KEY\` in backend/.env
4. Note: Free tier has usage limits


### 6. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs

## 📊 Sample Data

To test the platform, you can add sample data using the API endpoints:

### Add Sample Customers
\`\`\`bash
curl -X POST http://localhost:5000/api/customers/bulk \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '[
    {
      "name": "Abhishek kumar",
      "email": "abhi@gmail.com",
      "phone": "+91-9876543210"
    },
    {
      "name": "shubham pandey",
      "email": "sp@gmail.com",
      "phone": "+91-9876543211"
    }
  ]'
\`\`\`

### Add Sample Orders
\`\`\`bash
curl -X POST http://localhost:5000/api/orders/bulk \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '[
    {
      "customerEmail": "abhi@gmail.com",
      "amount": 15000,
      "status": "completed"
    },
    {
      "customerEmail": "sp@gmail.com",
      "amount": 8000,
      "status": "completed"
    }
  ]'
\`\`\`

## 🚀 Deployment

### Deploy to Vercel

#### Frontend Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

#### Backend Deployment
**Option 1: Vercel (Recommended)**
1. Create \`vercel.json\` in backend folder:
\`\`\`json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
\`\`\`
2. Deploy backend separately to Vercel
3. Update \`VITE_API_URL\` in frontend

**Option 2: Railway/Render**
1. Connect GitHub repository
2. Set environment variables
3. Deploy

### Environment Variables for Production
Update these in your deployment platform:

**Frontend (Vercel)**
- \`VITE_API_URL\`: Your backend API URL
- \`VITE_GOOGLE_CLIENT_ID\`: Google OAuth Client ID

**Backend (Vercel/Railway/Render)**
- \`MONGODB_URI\`: MongoDB Atlas connection string
- \`JWT_SECRET\`: Strong random string
- \`GOOGLE_CLIENT_ID\`: Google OAuth Client ID
- \`GOOGLE_CLIENT_SECRET\`: Google OAuth Client Secret
- \`OPENAI_API_KEY\`: OpenAI API key (optional)
- \`FRONTEND_URL\`: Your frontend URL

## 📖 API Documentation

The API is fully documented using Swagger. Access it at:
- **Development**: http://localhost:5000/api-docs
- **Production**: https://your-backend-url/api-docs

### Key Endpoints

#### Authentication
- \`POST /api/auth/google\` - Google OAuth login
- \`GET /api/auth/verify\` - Verify JWT token

#### Customers
- \`GET /api/customers\` - Get customers with pagination
- \`POST /api/customers\` - Create single customer
- \`POST /api/customers/bulk\` - Create multiple customers

#### Orders
- \`GET /api/orders\` - Get orders with pagination
- \`POST /api/orders\` - Create single order
- \`POST /api/orders/bulk\` - Create multiple orders

#### Campaigns
- \`GET /api/campaigns\` - Get user campaigns
- \`POST /api/campaigns\` - Create and launch campaign
- \`POST /api/campaigns/preview\` - Preview audience size

#### AI Features
- \`POST /api/ai/rules\` - Generate rules from natural language
- \`POST /api/ai/message\` - Generate message suggestions

## 🏗 Architecture

### System Architecture
\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Express Backend │    │   MongoDB       │
│   (Vite + React)│◄──►│  (Node.js + JWT) │◄──►│   (Atlas)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Google OAuth   │    │   OpenAI API    │    │  Vendor API     │
│  Authentication │    │   (AI Features) │    │  (Simulation)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

### Database Schema
- **Users**: Google OAuth user data
- **Customers**: Customer information and stats
- **Orders**: Order history and amounts
- **Campaigns**: Campaign configuration and stats
- **CommunicationLogs**: Message delivery tracking

### AI Integration
- **Natural Language Processing**: Convert user descriptions to MongoDB queries
- **Message Generation**: Create personalized campaign messages
- **Fallback System**: Rule-based parsing when AI is unavailable

## 🔍 Testing

### Manual Testing
1. **Authentication**: Test Google OAuth login/logout
2. **Data Management**: Add customers and orders via UI/API
3. **Campaign Creation**: Create campaigns with different rules
4. **AI Features**: Test natural language rule generation
5. **Delivery Simulation**: Monitor campaign delivery logs

### API Testing with Postman
Import the Swagger documentation into Postman for comprehensive API testing.

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Error
\`\`\`
Error: MongoNetworkError: failed to connect to server
\`\`\`
**Solution**: Check MongoDB URI and ensure MongoDB is running failed to connect to server
\`\`\`
**Solution**: Check MongoDB URI and ensure MongoDB is running

#### Google OAuth Error
\`\`\`
Error: Invalid client ID
\`\`\`
**Solution**: Verify Google Client ID in environment variables and Google Cloud Console

#### CORS Error
\`\`\`
Access to fetch blocked by CORS policy
\`\`\`
**Solution**: Check FRONTEND_URL in backend .env matches your frontend URL

#### OpenAI API Error
\`\`\`
Error: OpenAI API key not found
\`\`\`
**Solution**: Add OPENAI_API_KEY to backend .env or use fallback features

#### Port Already in Use
\`\`\`
Error: listen EADDRINUSE :::5000
\`\`\`
**Solution**: Kill process using port or change PORT in .env

### Debug Mode
Enable debug logging by setting:
\`\`\`env
NODE_ENV=development
\`\`\`

## 🔒 Security Considerations

### Implemented Security Features
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured for specific origins
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Joi validation for all API inputs
- **Helmet.js**: Security headers for Express
- **Environment Variables**: Sensitive data in .env files

### Production Security Checklist
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up MongoDB authentication
- [ ] Use environment variables for all secrets
- [ ] Enable API rate limiting
- [ ] Regular security updates

## 📈 Performance Optimization

### Database Optimization
- **Indexes**: Created on frequently queried fields
- **Pagination**: Implemented for large datasets
- **Aggregation**: Efficient campaign statistics calculation

### Frontend Optimization
- **Code Splitting**: React lazy loading
- **Caching**: React Query for API response caching
- **Optimized Images**: Placeholder images for better loading
- **Responsive Design**: Mobile-first approach

### Backend Optimization
- **Connection Pooling**: MongoDB connection optimization
- **Async Processing**: Campaign delivery in background
- **Error Handling**: Comprehensive error management

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Standards
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format
- **JSDoc**: Function documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Xeno**: For the internship opportunity and assignment
- **OpenAI**: For AI integration capabilities
- **Google**: For OAuth authentication services
- **MongoDB**: For database services
- **Vercel**: For hosting platform

## 📞 Support

For support and questions:
- **Email**: your-email@example.com
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/xeno-crm-platform/issues)
- **Documentation**: Check this README and API docs

## 🗺 Roadmap

### Future Enhancements
- [ ] Email/SMS integration with real providers
- [ ] Advanced analytics dashboard
- [ ] A/B testing for campaigns
- [ ] Customer journey mapping
- [ ] Integration with CRM systems
- [ ] Mobile app development
- [ ] Advanced AI features (sentiment analysis, predictive analytics)

---

**Built with ❤️ by Abhishek kumar for Xeno SDE Internship Assignment 2025**
