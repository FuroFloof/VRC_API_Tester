const vrchat = require("vrchat");
const readline = require("readline");

// Helper function to prompt user input
function prompt(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

(async () => {
    // Step 1: Prompt for username and password
    const username = await prompt("Enter your VRChat username: ");
    const password = await prompt("Enter your VRChat password: ");

    const configuration = new vrchat.Configuration({
        username,
        password,
    });

    const options = { headers: { "User-Agent": "HakaTainment/0.0.1 floofworks.0@gmail.com" } };

    // Step 2: Instantiate APIs
    const AuthenticationApi = new vrchat.AuthenticationApi(configuration);
    const UsersApi = new vrchat.UsersApi(configuration);
    const SystemApi = new vrchat.SystemApi(configuration);
    const FriendsApi = new vrchat.FriendsApi(configuration);

    try {
        // Step 3: Log in
        let resp = await AuthenticationApi.getCurrentUser(options);
        let currentUser = resp.data;

        // Step 3.5: Handle 2FA if required
        if (currentUser["requiresTwoFactorAuth"] && currentUser["requiresTwoFactorAuth"][0] === "totp") {
            const twoFactorCode = await prompt("Enter your 2FA code: ");
            await AuthenticationApi.verify2FA({ code: twoFactorCode }, options);
            resp = await AuthenticationApi.getCurrentUser(options);
            currentUser = resp.data;
        }

        console.log(`Logged in as: ${currentUser.displayName}`);

        // Fetch current online users
        const onlineUsersResp = await SystemApi.getCurrentOnlineUsers(options);
        console.log(`Current Online Users: ${onlineUsersResp.data}`);

        // Fetch specific user by ID
        const userResp = await UsersApi.getUser("usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469", options);
        console.log(`Fetched User: ${userResp.data.displayName}`);

        // Fetch Online Friends
        const onlineFriends = await FriendsApi.getFriends(0, FriendsApi.onlineFriends, false, options);
        console.log(onlineFriends);
    } catch (error) {
        console.error("An error occurred:", error.response?.data || error.message);
    }
})();
