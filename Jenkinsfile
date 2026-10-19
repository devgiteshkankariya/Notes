pipeline {
    agent any

    environment {
        SSH_TARGET = 'ssh -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=no ubuntu@172.31.36.189'
    }

    stages {
        stage('Pull Code on Notes Server') {
            steps {
                sh '''
                ${SSH_TARGET} "cd /home/ubuntu/Notes && git pull origin main"
                '''
            }
        }

        stage('Build Backend & Migrate DB') {
            steps {
                sh '''
                ${SSH_TARGET} "cd /home/ubuntu/Notes/backend && npm install && npx prisma db push && npm run build"
                '''
            }
        }

        stage('Build Frontend (Next.js)') {
            steps {
                sh '''
                ${SSH_TARGET} "cd /home/ubuntu/Notes/client && npm install && npm run build"
                '''
            }
        }

        stage('Restart PM2 Services') {
            steps {
                sh '''
                ${SSH_TARGET} "pm2 restart notes-backend || pm2 start /home/ubuntu/Notes/backend/dist/index.js --name 'notes-backend'"
                ${SSH_TARGET} "pm2 restart notes-frontend || pm2 start 'npm --prefix /home/ubuntu/Notes/client start' --name 'notes-frontend'"
                ${SSH_TARGET} "pm2 save"
                '''
            }
        }
    }

    post {
        success {
            echo '🎉 Remote Deployment to Notes-Server Succeeded!'
            echo '🌐 Live Site: https://notes.devgitesh.xyz'
        }
        failure {
            echo '❌ Remote deployment failed. Check the console output above.'
        }
    }
}
