function discord_message_send($webhook_url, $data) {
    if (!array_key_exists('avatar_url', $data))
        $data['avatar_url'] = 'nothing.test';


    if (!array_key_exists('username', $data))
        $data['username'] = "nothing.test";

    $session_curl = curl_init('https://discord.com/api/webhooks/', $webhook_url);

    return $session_curl;

}


// just new session, I will at it tho new file soon. 
