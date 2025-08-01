# Echoes - AI Companion for Grief and Closure

Echoes is a full-stack web application that provides a safe space for people to express unspoken words and find closure with those who matter to them. Using AI-powered conversations, users can process emotions, share memories, and create personalized letters of closure.

## Features

### 🔐 **Authentication System**
- User registration and login with JWT tokens
- Secure password hashing with bcrypt
- Protected routes and persistent sessions

### 💝 **Core Functionality**
- **Memory Builder**: Share cherished memories and unspoken thoughts
- **AI Conversations**: Emotionally intelligent chat that responds based on:
  - Emotional keywords (love, regret, gratitude, sadness)
  - User's shared memories
  - Conversation context
- **Final Letters**: Auto-generated personalized closure letters with PDF download
- **Session Management**: Save and continue multiple conversations

### 🛡️ **Security & Privacy**
- Encrypted data storage
- User-specific session isolation
- JWT-based authentication
- CORS protection

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling and development
- **React Router** for navigation
- **Bootstrap 5** for responsive UI design
- **React Icons** for beautiful iconography
- **Axios** for API communication
- **jsPDF** for PDF letter generation
- **Zustand** for state management

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for secure authentication
- **bcrypt** for password hashing
- **HuggingFace Inference API** for AI-powered conversations
- **CORS** for cross-origin requests
- **dotenv** for environment configuration

### AI & ML
- **HuggingFace Transformers** for natural language processing
- **DialoGPT** model for conversational AI
- **Emotion-aware response system** with contextual understanding
- **Intelligent fallback responses** for enhanced user experience

### Deployment
- **Backend**: Deployed on Render - [https://echoes-b18n.onrender.com](https://echoes-b18n.onrender.com)
- **Database**: MongoDB Atlas (Cloud)
- **Frontend**: Ready for deployment on Vercel/Netlify

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Echoes
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

## Frontend-Backend Connection

Your Echoes application uses a **seamless connection** between the React frontend and Node.js backend:

### 🔗 **API Integration**
- **Development**: Frontend (`localhost:5173`) → Backend (`localhost:8080`)
- **Production**: Frontend (`https://echoes-beta.vercel.app`) → Backend (`https://echoes-b18n.onrender.com`)

### 🔧 **Automatic Configuration**
- Environment-based API URL switching
- JWT token authentication for secure API calls
- CORS enabled for cross-origin requests
- Axios interceptors for automatic token attachment

### 📡 **Key API Endpoints Used by Frontend**
```javascript
// Authentication
POST /api/auth/login
POST /api/auth/register

// Sessions Management
GET /api/sessions
POST /api/sessions
GET /api/sessions/:id
PUT /api/sessions/:id
DELETE /api/sessions/:id

// AI Features
POST /api/ai/chat          // Main conversation feature
POST /api/ai/final-letter  // Letter generation
GET /api/ai/prompts        // Guided conversations
```

### Configuration

1. **Server Environment Variables**
   
   Create `server/.env`:
   ```env
   PORT=8080
   MONGODB_URI=mongodb://localhost:27017/echoes
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   HUGGINGFACE_API_KEY=your-huggingface-api-key-optional
   ```

2. **Client Environment Variables**
   
   Create `client/.env.development` for local development:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   ```
   
   Create `client/.env.production` for production:
   ```env
   VITE_API_BASE_URL=https://echoes-b18n.onrender.com/api
   ```

### Live Application

🌐 **Backend API**: [https://echoes-b18n.onrender.com](https://echoes-b18n.onrender.com)
📱 **Frontend Web App**: [https://echoes-beta.vercel.app](https://echoes-beta.vercel.app)

### Frontend Deployment

Your frontend is configured to automatically connect to the deployed backend. To deploy:

#### Deploy to Vercel (Recommended):
```bash
# Install Vercel CLI
npm i -g vercel

# In the client directory
cd client
npm run build
vercel --prod
```

#### Deploy to Netlify:
```bash
# Build the project
cd client
npm run build

# Deploy the dist folder to Netlify (drag & drop or CLI)
```

#### Deploy to GitHub Pages:
```bash
# Build and deploy
cd client
npm run build
# Upload dist folder contents to your GitHub Pages repository
```

**Note**: Your frontend will automatically use the production API (`https://echoes-b18n.onrender.com/api`) when deployed.

### Running the Application

#### For Local Development:

1. **Start MongoDB**
   - If using local MongoDB: `mongod`
   - If using MongoDB Atlas: Update the MONGODB_URI in server/.env

2. **Start the Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on http://localhost:8080

3. **Start the Frontend Client**
   ```bash
   cd client
   npm run dev
   ```
   Client will run on http://localhost:5173

4. **Access the Application**
   - Open http://localhost:5173 in your browser
   - Create an account or sign in
   - Start your healing journey!

#### For Production:

The application is already deployed and ready to use:
- **Backend**: [https://echoes-b18n.onrender.com](https://echoes-b18n.onrender.com)
- **Frontend**: Configure your frontend deployment to use the production API URL

## API Endpoints

**Base URL**: `https://echoes-b18n.onrender.com/api`

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Sessions
- `POST /api/sessions` - Create new conversation session
- `GET /api/sessions` - Get user's sessions
- `GET /api/sessions/:id` - Get specific session
- `PUT /api/sessions/:id` - Update session (memories, conversations, letter)
- `DELETE /api/sessions/:id` - Delete session

### AI Features
- `POST /api/ai/chat` - Generate AI response for conversation
- `GET /api/ai/prompts` - Get guided conversation prompts
- `POST /api/ai/final-letter` - Generate final letter for closure
- `POST /api/ai/sentiment` - Analyze sentiment of a message

## AI Intelligence Features

### 🧠 **Emotion-Aware Conversations**
The AI system analyzes user messages for emotional keywords and responds with appropriate empathy:
- **Grief responses**: Compassionate acknowledgment of loss and sadness
- **Anger responses**: Validating, non-defensive support
- **Love responses**: Celebrating and affirming deep connections
- **Hope responses**: Encouraging forward-looking perspectives

### 🎯 **Conversation Stage Awareness**
- **Initial conversations**: Warm, welcoming responses to build trust
- **Developing conversations**: Emotion-specific therapeutic guidance
- **Deep conversations**: Theme-aware responses that encourage growth

### 🔄 **Intelligent Fallback System**
- **Primary**: HuggingFace API with DialoGPT model
- **Secondary**: Contextual response generation based on conversation analysis
- **Tertiary**: Emotion-appropriate fallback responses for reliability

### ✉️ **Personalized Letter Generation**
AI creates closure letters that incorporate:
- Shared memories from the conversation
- Emotional themes from the dialogue
- Relationship context and dynamics
- Healing-focused, forward-looking messages

## Project Structure

```
Echoes/
├── client/                     # React TypeScript frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── EnhancedChat.tsx
│   │   │   ├── FinalLetter.tsx
│   │   │   ├── GuidedPrompts.tsx
│   │   │   ├── MemoryBuilder.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/             # Route components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── SessionPage.tsx
│   │   ├── context/           # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── services/          # API service layer
│   │   │   └── api.ts
│   │   ├── assets/            # Static assets
│   │   └── App.tsx            # Main app component
│   ├── public/                # Public assets
│   ├── .env.development       # Development environment
│   ├── .env.production        # Production environment
│   └── package.json
├── server/                    # Node.js Express backend
│   ├── controllers/           # Route controllers
│   │   ├── aiController.js
│   │   ├── authController.js
│   │   └── sessionController.js
│   ├── middleware/            # Express middleware
│   │   └── auth.js
│   ├── models/               # Mongoose models
│   │   ├── Session.js
│   │   └── User.js
│   ├── routes/               # API routes
│   │   ├── ai.js
│   │   ├── auth.js
│   │   └── sessions.js
│   ├── services/             # Business logic services
│   │   ├── aiService.js
│   │   └── huggingfaceService.js
│   ├── config/               # Configuration
│   │   └── database.js
│   ├── index.js              # Express server entry
│   └── package.json
├── training/                  # AI training documentation
│   └── openai-finetuning.md
├── AI_IMPLEMENTATION_SUMMARY.md
├── AI_SETUP_GUIDE.md
├── AI_STRATEGY.md
└── README.md
```

## Key Components

### Frontend Components
- **Landing**: Welcome page for unauthenticated users
- **Login/Register**: Authentication forms
- **Dashboard**: User's session overview
- **SessionPage**: Main conversation interface
- **MemoryBuilder**: Component for adding memories
- **ChatInterface**: AI conversation component
- **FinalLetter**: Letter generation and editing

### Backend Models
- **User**: User accounts with authentication
- **Session**: Conversation sessions with memories, conversations, and letters

## AI Conversation Logic

The AI responds intelligently based on:

1. **Emotional Keywords**:
   - Regret: "sorry", "should have", "regret", "wish i"
   - Love: "love", "miss", "care"
   - Gratitude: "thank", "grateful", "appreciate"
   - Sadness: "sad", "hurt", "pain", "cry"
   - Anger: "angry", "mad", "frustrated"

2. **Memory References**: Occasionally references user's shared memories

3. **Conversation Context**: Different responses for first messages vs ongoing conversation

4. **Closure Focus**: Guides users toward healing and peace

## Development

### Adding New Features
1. Backend: Add routes in `server/index.js`
2. Frontend: Create components in `client/src/components/`
3. API: Update service layer in `client/src/services/api.ts`

### Database Schema
```javascript
// User Schema
{
  email: String (unique),
  password: String (hashed),
  name: String,
  createdAt: Date
}

// Session Schema
{
  userId: ObjectId,
  personName: String,
  memories: [{ content: String, timestamp: Date }],
  conversations: [{ message: String, isUser: Boolean, timestamp: Date }],
  finalLetter: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Deployment

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Update environment variables

### Backend (Heroku/Railway)
1. Set environment variables
2. Deploy with `npm start`
3. Update CORS origins

### Database (MongoDB Atlas)
1. Create cluster
2. Update MONGODB_URI
3. Configure network access

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.

---

**Echoes** - A safe space for healing conversations and closure. 💙
