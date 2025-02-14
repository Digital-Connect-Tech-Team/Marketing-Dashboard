import { WebSocketServer, WebSocket } from 'ws';
import pkg from '@prisma/client';

const { PrismaClient, ver03 } = pkg;

const prisma = new PrismaClient();
const wss = new WebSocketServer({ port: 8080 });

console.log('WebSocket server is running on ws://localhost:8080');

// Type สำหรับข้อความที่ส่งผ่าน WebSocket
/**
 * @typedef {Object} WebSocketMessage
 * @property {'all_data' | 'new_data'} event
 * @property {ver03 | ver03[]} data
 */

// ฟังก์ชัน Broadcast ส่งข้อมูลไปยังทุก client
function broadcastMessage(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// ฟังการเชื่อมต่อใหม่
wss.on('connection', (ws) => {
  console.log('New client connected');

  // เมื่อ client เชื่อมต่อแล้ว ให้ส่งข้อมูลทั้งหมดในตาราง ver03 ไปให้
  prisma.ver03.findMany().then((records) => {
    const message = { event: 'all_data', data: records };
    ws.send(JSON.stringify(message));
  });

  // รับคำสั่งจาก client
  ws.on('message', async (message) => {
    try {
      const parsed = JSON.parse(message);

      if (parsed.event === 'new_data') {
        // เพิ่มข้อมูลใหม่เข้าในตาราง ver03
        const newRecord = await prisma.ver03.create({
          data: parsed.data,  // ใช้ข้อมูลที่ส่งมาจาก client
        });

        // ส่งข้อมูลใหม่ให้ทุก client
        broadcastMessage({ event: 'new_data', data: newRecord });
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
