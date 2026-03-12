"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const auth_1 = __importDefault(require("./routes/auth"));
const projects_1 = __importDefault(require("./routes/projects"));
const tickets_1 = __importDefault(require("./routes/tickets"));
const todos_1 = __importDefault(require("./routes/todos"));
const kanbanConfig_1 = __importDefault(require("./routes/kanbanConfig"));
const kanbanBoards_1 = __importDefault(require("./routes/kanbanBoards"));
const userSettings_1 = __importDefault(require("./routes/userSettings"));
const documents_1 = __importDefault(require("./routes/documents"));
const pdf_1 = __importDefault(require("./routes/pdf"));
const auth_2 = require("./middleware/auth");
const collaboration_1 = require("./services/collaboration");
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 3001;
// Setup Socket.IO for collaboration
(0, collaboration_1.setupSocketIO)(httpServer);
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
// Static file serving for uploads
app.use('/uploads', express_1.default.static(path_1.default.join(process.env.UPLOAD_DIR || '/app/uploads')));
// Public routes
app.use('/api/auth', auth_1.default);
// Health check (public)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Protected routes
app.use('/api/projects', auth_2.authMiddleware, projects_1.default);
app.use('/api/tickets', auth_2.authMiddleware, tickets_1.default);
app.use('/api/todos', auth_2.authMiddleware, todos_1.default);
app.use('/api/kanban-config', auth_2.authMiddleware, kanbanConfig_1.default);
app.use('/api/kanban-boards', auth_2.authMiddleware, kanbanBoards_1.default);
app.use('/api/users', auth_2.authMiddleware, userSettings_1.default);
app.use('/api/documents', auth_2.authMiddleware, documents_1.default);
app.use('/api/pdf', auth_2.authMiddleware, pdf_1.default);
// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
// Only start the server when not in test mode
if (process.env.NODE_ENV !== 'test') {
    httpServer.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
}
//# sourceMappingURL=index.js.map