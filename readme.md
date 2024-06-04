# Functional Requirements
- Direct messaging
- Group messaging
- Able to search messages
- Online / offline status
- Friend requests
- Typing status when a friend is typing a message
- Delete a message before a time period

# Non functional requirements
- Availability
- Low latency

# Technologies
- Next.js
- NodeJs
- Mongo DB
- Redis
- OpenSearch

# Architecture
![image](https://raw.githubusercontent.com/harshit973/chat-app/master/Chat%20app%20architecture.png)

# Pros

- It offers high availability 
- It has low latency
- It is horizontally scalable

# Trade offs
- Down Scaling or upscaling system when users are connected can lead to disconnection of websockets and make user status offline till he is connected again
- It does not offers strong consistency 

# Screenshots
![image](https://raw.githubusercontent.com/harshit973/chat-app/master/add_friend.png)
![image](https://raw.githubusercontent.com/harshit973/chat-app/master/add_group.png)
![image](https://raw.githubusercontent.com/harshit973/chat-app/master/chat_screen.png)
![image](https://raw.githubusercontent.com/harshit973/chat-app/master/chat_screen_group.png)
![image](https://raw.githubusercontent.com/harshit973/chat-app/master/login_screen.png)
![image](https://raw.githubusercontent.com/harshit973/chat-app/master/register_screen.png)