/**
 * Script recalculate word_count cho tất cả chapters
 * Chạy: node scripts/recalculate-word-count.js
 */

const pool = require('../src/config/db');
const { countWords } = require('../src/utils/helpers');

async function recalculateWordCount() {
    try {
        console.log('Đang lấy danh sách chapters...');
        const [chapters] = await pool.query('SELECT id, title, content, word_count FROM chapters');
        
        console.log(`Tìm thấy ${chapters.length} chapters`);
        
        let updated = 0;
        for (const chapter of chapters) {
            const newWordCount = countWords(chapter.content);
            
            if (newWordCount !== chapter.word_count) {
                await pool.query('UPDATE chapters SET word_count = ? WHERE id = ?', [newWordCount, chapter.id]);
                console.log(`[${chapter.id}] "${chapter.title}": ${chapter.word_count} -> ${newWordCount} từ`);
                updated++;
            }
        }
        
        console.log(`\nHoàn thành! Đã cập nhật ${updated}/${chapters.length} chapters.`);
        process.exit(0);
    } catch (error) {
        console.error('Lỗi:', error.message);
        process.exit(1);
    }
}

recalculateWordCount();
