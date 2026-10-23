# QuizMaster – Spring Boot 3 & MySQL Backend Setup

This directory contains the production-grade **Java 21 Spring Boot 3** backend with **Spring Security Google OAuth 2.0 / OpenID Connect** and **MySQL** database persistence.

---

## 1. Prerequisites
- **Java Development Kit (JDK)**: Version 21 LTS (`java -version`)
- **Apache Maven**: Version 3.8+ (`mvn -version`)
- **MySQL Database Server**: Version 8.0+
- **Google Cloud Platform (GCP) Account**

---

## 2. Google Cloud Platform OAuth 2.0 Setup

1. **Open Google Cloud Console**:
   Visit [https://console.cloud.google.com/](https://console.cloud.google.com/) and create a new project called `QuizMaster-Examination`.

2. **Configure the OAuth Consent Screen**:
   - Navigation: **APIs & Services** > **OAuth consent screen**.
   - User Type: Select **External** and click **Create**.
   - App Information:
     - App name: `QuizMaster`
     - User support email: Select your verified Google email (e.g., `jaanavin03@gmail.com`).
     - Developer contact: Enter your email.
   - Scopes: Click **Add or Remove Scopes** and select:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Test Users: Add testing email addresses (e.g. `jaanavin03@gmail.com`).

3. **Create OAuth 2.0 Credentials**:
   - Navigation: **APIs & Services** > **Credentials** > **Create Credentials** > **OAuth client ID**.
   - Application Type: **Web application**.
   - Name: `QuizMaster Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (Frontend dev server)
     - `http://localhost:8080` (Spring Boot server)
     - `https://your-production-domain.com` (Production domain)
   - **Authorized redirect URIs** (Spring Security standard OAuth2 callback):
     - `http://localhost:8080/login/oauth2/code/google` (Standard Spring Security URI)
     - `http://localhost:3000` (Direct SPA GSI callback)
     - `https://your-production-domain.com/login/oauth2/code/google`
   - Click **Create** and safely copy your **Client ID** and **Client Secret**.

---

## 3. Database Initialization (MySQL)

Create the database and tables using the provided schema:
```bash
mysql -u root -p < src/main/resources/schema.sql
```

---

## 4. Environment Variables Configuration

Export the environment variables before starting the Spring Boot server:

```bash
# Google OAuth2 Credentials
export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"

# MySQL Database Connection
export MYSQL_HOST="localhost"
export MYSQL_PORT="3306"
export MYSQL_DATABASE="quizmaster_db"
export MYSQL_USER="root"
export MYSQL_PASSWORD="your_mysql_password"

# Frontend URL
export FRONTEND_URL="http://localhost:3000"
```

---

## 5. Build and Run

```bash
# Package the JAR application
mvn clean package -DskipTests

# Run the Spring Boot application
java -jar target/quizmaster-backend-1.0.0.jar
```
The server will start on port `8080`.

---

## 6. Security Features Implemented
- **True OpenID Connect**: Uses Google's stable `sub` claim for primary external identity proof, not spoofable email alone.
- **Role-Based Access Control (RBAC)**: Only designated emails receive `ROLE_ADMIN`; all others receive `ROLE_STUDENT`.
- **Session Protection**: `HttpOnly`, `SameSite=Lax`, and `Secure` (over HTTPS) session cookies preventing XSS token theft.
- **CSRF & CORS**: Configured to safely permit the React SPA while safeguarding mutation endpoints.
