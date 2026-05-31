const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'records.json');

function loadRecords() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('加载记录失败:', e);
    }
    return [];
}

function saveRecords(records) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
        return true;
    } catch (e) {
        console.error('保存记录失败:', e);
        return false;
    }
}

const server = http.createServer((req, res) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers);
        res.end();
        return;
    }

    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('服务器错误');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
        return;
    }

    if (req.url === '/api/records' && req.method === 'GET') {
        const records = loadRecords();
        res.writeHead(200, headers);
        res.end(JSON.stringify({ success: true, records }));
        return;
    }

    if (req.url === '/api/records' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { text } = JSON.parse(body);
                if (!text) {
                    res.writeHead(400, headers);
                    res.end(JSON.stringify({ success: false, error: '缺少text参数' }));
                    return;
                }

                const records = loadRecords();
                const newRecord = {
                    id: Date.now(),
                    text,
                    time: new Date().toLocaleString('zh-CN')
                };
                records.unshift(newRecord);
                
                if (records.length > 20) {
                    records.splice(20);
                }
                
                saveRecords(records);
                
                res.writeHead(200, headers);
                res.end(JSON.stringify({ success: true, record: newRecord }));
            } catch (e) {
                res.writeHead(400, headers);
                res.end(JSON.stringify({ success: false, error: '请求格式错误' }));
            }
        });
        return;
    }

    if (req.url === '/api/records' && req.method === 'DELETE') {
        fs.writeFileSync(DATA_FILE, '[]');
        res.writeHead(200, headers);
        res.end(JSON.stringify({ success: true }));
        return;
    }

    res.writeHead(404, headers);
    res.end(JSON.stringify({ success: false, error: '接口不存在' }));
});

server.listen(PORT, () => {
    console.log(`
========================================
晶体晶胞堆积模拟服务器已启动
========================================
访问地址: http://localhost:${PORT}
API接口:
  GET  /api/records     - 获取学习记录
  POST /api/records     - 添加学习记录
  DELETE /api/records   - 清空学习记录
========================================
按 Ctrl+C 停止服务器
    `);
});
