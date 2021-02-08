class SubscriptionService {
    constructor(ctx) {
        this.blueTickMeAgent = ctx.httpAgents.blueTickMeAgent;
    }

    storeSubscription(subscription) {
        return this.blueTickMeAgent.post('/webPushSubscription', subscription)
            .then((response) => {
                return response.data;
            });
    }
}

module.exports = SubscriptionService;
