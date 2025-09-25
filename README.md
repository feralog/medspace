# 🧠 MedSpace - Spaced Repetition for Medical Students

Ultra-fast topic addition and review scheduling for medical studies.

## 🎯 Features

- **⚡ Ultra-fast topic addition**: Add study topics in <10 seconds during lectures
- **📅 Weekly calendar view**: See all pending reviews at a glance
- **🎨 Color-coded subjects**: Automatic color assignment for each medical subject
- **🔄 Fixed spaced repetition**: Medical-optimized intervals (1, 3, 7, 14, 30, 60, 120 days)
- **📱 Mobile-first PWA**: Works offline, installable on phones
- **⚡ Keyboard shortcuts**: Press Space or 'A' to add topics quickly
- **🏷️ Smart tags**: Quick tags for common classifications
- **💾 Local storage**: No accounts needed, data stays on your device

## 🚀 Getting Started

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/feralog/medspace.git
   cd medspace
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**: http://localhost:3000

### Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel** (recommended):
   ```bash
   vercel --prod
   ```

## 📖 How to Use

### Adding Topics (During Lectures)

1. **Press Space** or click "Adicionar" button
2. **Enter subject** (e.g., "Pediatria")
3. **Enter topic** (e.g., "Nutrologia Pediátrica")
4. **Select source** (Aula/Livro/Vídeo/Outro)
5. **Add tags** (optional: importante, prova, etc.)
6. **Press Enter** or click "Adicionar"

**⏱️ Target: Complete in <10 seconds**

### Reviewing Topics

1. **Check weekly calendar** for today's reviews
2. **Study the topic** using your materials
3. **Click the checkbox** when review is complete
4. **Next review automatically scheduled**

### Keyboard Shortcuts

- `Space` or `A`: Open add topic modal
- `Ctrl + Enter`: Submit form quickly
- `Escape`: Close modal

## 🎨 Medical Blue/Gray Theme

The app uses a professional medical color scheme:

- **Primary Blue**: #3b82f6 (buttons, highlights)
- **Medical Gray**: #64748b (text, backgrounds)
- **Subject Colors**: Auto-assigned distinct colors for each medical subject

## 📱 PWA Features

- **Installable**: Add to home screen on mobile/desktop
- **Offline capable**: Works without internet (data stored locally)
- **Fast loading**: Optimized for quick access during lectures
- **Push notifications**: (Future feature for review reminders)

## 🔧 Technical Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom medical theme
- **Storage**: LocalStorage (no backend required)
- **PWA**: Custom manifest with shortcuts
- **Mobile**: Responsive design, mobile-first approach

## 📊 Spaced Repetition Schedule

Topics are automatically scheduled for review at optimal intervals:

1. **1st review**: 1 day after creation
2. **2nd review**: 3 days after 1st
3. **3rd review**: 1 week after 2nd
4. **4th review**: 2 weeks after 3rd
5. **5th review**: 1 month after 4th
6. **6th review**: 2 months after 5th
7. **7th review**: 4 months after 6th

After completing all 7 reviews, the topic is considered "mastered."

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Main layout with PWA metadata
│   └── page.tsx            # Home page with calendar
├── components/
│   ├── AddTopicModal.tsx   # Ultra-fast topic addition
│   └── WeeklyCalendar.tsx  # Weekly review calendar
├── types/
│   └── index.ts            # TypeScript interfaces
└── utils/
    ├── spaced-repetition.ts # SR algorithm logic
    └── storage.ts           # LocalStorage utilities
```

## 🎯 Usage Metrics Goals

- **Topic addition time**: <10 seconds
- **Daily usage rate**: >90%
- **Review completion rate**: >80%
- **Mobile usage**: >70%

## 🔮 Future Enhancements

- [ ] Push notifications for review reminders
- [ ] Data export/import (JSON, CSV)
- [ ] Study streaks and statistics
- [ ] Subject-specific statistics
- [ ] Sync across devices (optional cloud backup)
- [ ] Voice input for topic addition

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on mobile and desktop
5. Submit a pull request

## 📄 License

MIT License - feel free to use this for your medical studies!

---

**Built for medical students who value their time and want to maximize retention through proven spaced repetition techniques.** ⚕️
