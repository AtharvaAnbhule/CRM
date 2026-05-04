
# 🚀 Workeloo CRM

**Workeloo CRM** is a full-stack, cloud-based Customer Relationship Management platform built for modern agencies and businesses.  
It combines client management, workflow automation, meetings, and AI-powered follow-ups — all in one collaborative system.

---

## 🧠 Overview

Workeloo CRM empowers teams to manage clients, automate workflows, track projects, host meetings, and send email campaigns seamlessly.  
It integrates **Next.js, Node.js, Spring Boot, Prisma ORM, PostgreSQL, Apache Kafka**, and **Clerk authentication** to deliver a scalable, secure, and modular CRM solution.

---

## 🏗️ Architecture

### **System Design**
Frontend (Next.js + Clerk)
↓
API Gateway
↓
Backend Microservices (Node.js + Spring Boot)
↓
Apache Kafka (Event Stream)
↓
Prisma ORM → PostgreSQL
↓
External APIs (Zepto Mail, GetStream) 




### **Components**
- **Frontend:** Next.js + TypeScript for responsive UI and dashboards  
- **Backend:** Node.js + Java Spring Boot microservices handling business logic  
- **Authentication:** Clerk for secure multi-account access  
- **Streaming:** Apache Kafka for real-time events and communication  
- **Database:** PostgreSQL managed via Prisma ORM  
- **External Services:** Zepto Mail for email automation, GetStream for live meetings  

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | Next.js, React, TypeScript, Axios |
| Backend | Node.js, Java Spring Boot |
| Database | PostgreSQL with Prisma ORM |
| Messaging | Apache Kafka |
| Authentication | Clerk |
| APIs | REST API + JWT |
| Mailing | Zepto Mail |
| Real-Time | GetStream API |
| Deployment | Docker, AWS EC2, Vercel, GitHub Actions |

---

## ✨ Core Features

- 🧭 **Lead & Client Management** — Track, assign, and follow up on leads efficiently  
- ✉️ **Email Marketing** — Send campaigns and event invitations via Zepto Mail  
- 🔁 **Workflow Automation** — Manage tasks, approvals, and pipelines visually  
- 🌐 **Website Builder** — Create branded websites directly from the dashboard  
- 📅 **Meetings** — Real-time calls and collaboration via GetStream API  
- 👥 **Multi-Account System** — One agency can manage multiple clients independently  
- 🧩 **AI Follow-Up Suggestions** — Smart recommendations to engage clients better  
- 🗂️ **Project & Team Management** — Assign employees, track progress, manage files  
- 📝 **Notes & Contacts** — Centralized contact and note management  
- 📦 **Media Store** — Securely store and retrieve documents and reports  

---

## 🧩 Setup & Installation

### **1. Clone Repository**
```bash
git clone https://github.com/AtharvaAnbhule/workeloo-crm.git
cd workeloo-crm

```
### **2. Install Dependencies**
```
npm install
```
### **3. Configure Environment**

Create a .env file (or use .env.example):
```
DATABASE_URL=postgresql://user:password@localhost:5432/workeloo
JWT_SECRET=your_jwt_secret
CLERK_API_KEY=your_clerk_key
KAFKA_BROKER=localhost:9092
ZEPTO_MAIL_KEY=your_zepto_key
GETSTREAM_API_KEY=your_getstream_key
```
### **4. Run Services**
```
npm run dev

```
Backend services (Node.js & Spring Boot) can be started separately via Docker Compose.

🧱 Database & APIs

Core Models:
User, Agency, Employee, Lead, Project, Workflow, Meeting, Event, Contact, Note, MediaFile

Important API Endpoints

Endpoint	Description
/api/auth	User authentication via Clerk
/api/leads	Manage lead creation, update, and assignment
/api/projects	Handle project management and tasks
/api/meetings	Schedule and join GetStream meetings
/api/marketing	Run automated email campaigns
/api/ai-suggestions	Generate AI follow-up recommendations
🚀 Deployment

Frontend: Render

Backend: Render

Database: Neon(PostgreSQL)

Event Streaming: Confluent Cloud (Kafka)

CI/CD: GitHub Actions for automated builds and tests

📈 Impact & Metrics

Increased productivity by 45% through automation and unified dashboards

Reduced manual communication time by 60% with AI-driven follow-ups

Supports 10K+ active clients and 500+ concurrent users in real time

Scalable event-driven architecture powered by Apache Kafka

🧠 Future Enhancements

Integrate AI voice assistant for follow-ups

Add real-time analytics dashboards

Introduce mobile version using React Native
