export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { DBManager } = await import('./server/db');
    const cron = (await import('node-cron')).default;

    // Initialize Database asynchronously
    DBManager.init().catch((err: any) => {
      console.warn('Database initialization note:', err?.message || err);
    });

    // Schedule daily snapshot at exactly 12:00 AM (Midnight) Bangladesh Time
    cron.schedule('0 0 * * *', () => {
      try {
        DBManager.snapshotDailyPrices();
      } catch (e) {
        console.error('Midnight snapshot failed:', e);
      }
    }, {
      timezone: 'Asia/Dhaka'
    });
  }
}
