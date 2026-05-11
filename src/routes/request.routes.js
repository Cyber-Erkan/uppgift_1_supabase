import { Router } from 'express';
import { listMessages, sendMessage, showForm, showEdit, updateMessage, deleteMessage } from '../controllers/request.controller.js';

export const requestRoutes = Router();

requestRoutes.get('/', showForm);
requestRoutes.post('/send', sendMessage);
requestRoutes.get('/messages', listMessages);
requestRoutes.get('/messages/:id/edit', showEdit);
requestRoutes.post('/messages/:id/update', updateMessage);
requestRoutes.post('/messages/:id/delete', deleteMessage);
