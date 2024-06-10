interface routeType {
    login: string,
    signup: string,
    chatHome: string,
    conversationRoom: ConversationRouteDetails
}

interface ConversationRouteDetails {
    path: string,
    paramConversationId: string,
    buildUrl(paramConversationId: string):string
} 

export const routes:routeType = {
    login:"/login",
    signup: "/signup",
    chatHome: "/chat",
    conversationRoom: {
        path: "/chat/:conversationId",
        paramConversationId: ":conversationId",
        buildUrl: function(paramConversationId: string):string{
            return this.path.replace(this.paramConversationId,paramConversationId)
        }
    }
}