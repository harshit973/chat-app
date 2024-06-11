# Functional Requirements
- Direct messaging
- Group messaging
- Able to search messages
- Online / offline status
- Friend requests
- Typing status when a friend is typing a message
- Delete a message before a time period
- Able to add new existing friends to the group

# Non functional requirements
- Availability
- Low latency
- Highly scalable

# Technologies
- Next.js
- NodeJs
- Mongo DB
- Redis
- OpenSearch
- TinyUrl

# Architecture
![image](https://raw.githubusercontent.com/harshit973/chat-app/master/Chat%20app%20architecture.png)

# Pros

- It offers high availability 
- It has low latency
- It is horizontally scalable
  
# Microservices
- chat-service: handles direct messaging between users.
- group-chat-service: handles group messaging.
- auth-service: handles authentication, login, registration, and decoding of the authorization token.
- status-service: handles online and offline status.
- relationship-service: managing friend requests and adding new people to the group.

# Trade offs
- Down Scaling or upscaling system when users are connected can lead to reconnection of websockets and increase load on user's bandwidth
- It does not offers strong consistency

# Future scope
- Instead of using tinyUrl for generating invitation url I will make a url shortner service for generating these url's
- I will add feature of exchanging media files along with text messages to each other 

# Screenshots
![image](https://raw.githubusercontent.com/harshit973/chat-app/master/add_friend.png)
![image](https://raw.githubusercontent.com/harshit973/chat-app/master/add_group.png)
![image](https://raw.githubusercontent.com/harshit973/chat-app/master/chat_screen.png)
![image](https://raw.githubusercontent.com/harshit973/chat-app/master/chat_screen_group.png)
![image](https://raw.githubusercontent.com/harshit973/chat-app/master/Login_screen.png)
![image](https://raw.githubusercontent.com/harshit973/chat-app/master/Register_screen.png)
![image](https://raw.githubusercontent.com/harshit973/chat-app/master/Invitation_create_popup.png)
![image](https://raw.githubusercontent.com/harshit973/chat-app/master/Invitation_url_generate.png)
