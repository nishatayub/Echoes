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
- **React Router** for navigation
- **Bootstrap 5** for responsive UI
- **React Icons** for beautiful icons
- **Axios** for API communication
- **jsPDF** for letter generation

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** for cross-origin requests

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

### Configuration

1. **Server Environment Variables**
   
   Create `server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/echoes
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

2. **Client Environment Variables**
   
   Create `client/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start MongoDB**
   - If using local MongoDB: `mongod`
   - If using MongoDB Atlas: Update the MONGODB_URI in server/.env

2. **Start the Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on http://localhost:5000

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

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/user` - Get current user (protected)

### Sessions
- `POST /api/sessions` - Create new conversation session
- `GET /api/sessions` - Get user's sessions
- `GET /api/sessions/:id` - Get specific session
- `PUT /api/sessions/:id` - Update session (memories, conversations, letter)
- `DELETE /api/sessions/:id` - Delete session

## Project Structure

```
Echoes/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Route components
│   │   ├── context/       # React contexts (Auth)
│   │   ├── services/      # API service layer
│   │   └── App.tsx        # Main app component
│   ├── public/
│   └── package.json
├── server/                # Node.js backend
│   ├── index.js          # Express server
│   ├── .env              # Environment variables
│   └── package.json
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
