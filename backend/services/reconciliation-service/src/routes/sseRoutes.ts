import express from 'express';
import { eventService, TransactionEvent } from '../services/eventService';

const router: express.Router = express.Router();


const clients = new Map<express.Response, (event: TransactionEvent) => void>();


router.get('/events', (req: express.Request, res: express.Response) => {

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Event stream connected', timestamp: new Date().toISOString() })}\n\n`);


    const eventHandler = (event: TransactionEvent) => {
        try {
            res.write(`data: ${JSON.stringify(event)}\n\n`);
        } catch (error) {
            console.error('Error sending SSE event:', error);
            clients.delete(res);
            if (clients.has(res)) {
                eventService.off('transaction-event', clients.get(res)!);
            }
            res.end();
        }
    };


    clients.set(res, eventHandler);
    eventService.on('transaction-event', eventHandler);

    req.on('close', () => {
        const handler = clients.get(res);
        if (handler) {
            eventService.off('transaction-event', handler);
        }
        clients.delete(res);
        res.end();
    });
});

export default router;
