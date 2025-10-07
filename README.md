# FloatChat - Oceanographic Data Analysis Platform

FloatChat is a modern, interactive platform for exploring and analyzing ARGO oceanographic data. It provides a user-friendly interface to query, visualize, and gain insights from oceanographic measurements collected by ARGO floats worldwide.

## 🌊 Features

- **Interactive Dashboard**: Visualize oceanographic data with beautiful, responsive charts and maps
- **Natural Language Querying**: Ask questions about ocean data in plain English
- **Advanced Search**: Filter and explore ARGO float data by location, date range, and parameters
- **Data Visualization**: Generate charts for temperature, salinity, and other ocean parameters
- **Export Capabilities**: Download datasets for further analysis
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Python 3.8+ (for some data processing scripts)
- Supabase account (for database)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/float-chat.git
   cd float-chat
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Install Python dependencies (for data processing):
   ```bash
   pnpm run python:setup
   ```

### Running the Application

Start the development server:
```bash
pnpm run dev:full
```

This will start both the Next.js application and the MCP server.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Data Visualization**: Recharts
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Vector Search**: FAISS
- **State Management**: React Hooks
- **Form Handling**: React Hook Form with Zod validation

## 📊 Data Sources

FloatChat integrates with the ARGO float dataset, which provides:
- Temperature and salinity profiles
- Ocean current measurements
- Water quality indicators
- Thermocline depth data

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- ARGO Program for the oceanographic data
- The open-source community for amazing tools and libraries
- All contributors who have helped improve FloatChat

---

FloatChat is built with ❤️ for oceanographers, researchers, and anyone interested in exploring our oceans.
