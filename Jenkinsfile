pipeline {
    agent any

    stages {
        stage('Pull Latest Code from GitHub') {
            steps {
                sh '''
                sudo -u ubuntu bash -c "cd /home/ubuntu/Notes && git pull origin main"
                '''
            }
        }

        stage('Install & Build Backend') {
            steps {
                sh '''
                sudo -u ubuntu bash -c "cd /home/ubuntu/Notes/backend && npm install && npx prisma db push && npm run build"
                '''
            }
        }

        stage('Install & Build Frontend') {
            steps {
                sh '''
                sudo -u ubuntu bash -c "cd /home/ubuntu/Notes/client && npm install && npm run build"
                '''
            }
        }

        stage('Restart PM2 Services') {
            steps {
                sh '''
                sudo -u ubuntu bash -c "pm2 restart notes-backend || pm2 start /home/ubuntu/Notes/backend/dist/index.js --name 'notes-backend'"
                sudo -u ubuntu bash -c "pm2 restart notes-frontend || pm2 start 'npm --prefix /home/ubuntu/Notes/client start' --name 'notes-frontend'"
                sudo -u ubuntu bash -c "pm2 save"
                '''
            }
        }
    }

    post {
        success {
            echo '🎉 Deployment to EC2 Succeeded! Site is live at http://54.66.180.40'
        }
        failure {
            echo '❌ Deployment failed. Check the console output above.'
        }
    }
}
