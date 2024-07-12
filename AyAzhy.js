const Discord = require('discord.js');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

// Discord bot token (replace with your own bot token)
const TOKEN = 'MTI1OTU5NDk5MjM0Nzc3OTEyMw.GRFZv9.JcTXA38cJ-VkByNZz9mR39_aTie2ToLHZ6fgUc';

// Create a new Discord client
const client = new Discord.Client();

// Create an Express application
const app = express();
const port = 3000; // Port for the web server (adjust as needed)

// Middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Kanal ID'si
const allowedChannelId = '1250341383626293302';

// Son kullanma zamanı (bir saatte bir)
let cooldowns = new Set();

// Serve a basic HTML form for editing the file
app.get('/', (req, res) => {
  const form = `
    <form action="/edit" method="post">
      <textarea name="content" rows="10" cols="50"></textarea><br>
      <input type="submit" value="Submit">
    </form>
  `;
  res.send(form);
});

// Handle POST request to edit the file
app.post('/edit', (req, res) => {
  const { content } = req.body;

  try {
    // Write the new content to the text file
    fs.writeFileSync('valorantacc.txt', content);
    res.send('Text file updated successfully.');
  } catch (err) {
    console.error('Error writing file:', err);
    res.status(500).send('Error updating text file.');
  }
});

// Command: Count lines in the text file
client.on('message', async (message) => {
  if (message.content.startsWith('!stock')) {
    try {
      // Read the text file
      const data = fs.readFileSync('valorantacc.txt', 'utf8');
      const lines = data.split('\n').map(line => line.trim()).filter(line => line !== '');
      
      // Send the number of lines to the channel
      await message.channel.send(`Hesap Stoğu: ${lines.length}`);

    } catch (err) {
      console.error('Error reading file:', err);
      await message.channel.send('Error reading text file.');
    }
  }
});

// Command: Get text from file and send to user's DM
client.on('message', async (message) => {
  if (message.content.startsWith('!free') && message.channel.id === allowedChannelId) {
    try {
      // Check cooldown
      if (cooldowns.has(message.author.id)) {
        await message.channel.send('Bu komutu tekrar kullanabilmek için 1 saat beklemelisiniz.');
        return;
      }
    else {
        await message.channel.send(`Kral Bu Komutu Sadece <#${allowedChannelId}> Kanalında Kullanabilirsin`);
    }

      // Open the text file
      const data = fs.readFileSync('valorantacc.txt', 'utf8');
      const lines = data.split('\n').map(line => line.trim()).filter(line => line !== '');

      if (lines.length === 0) {
        await message.channel.send('Text file is empty.');
        return;
      }

      // Send the first line to user's DM
      const firstLine = lines[0];
      await message.author.send(firstLine);
      await message.channel.send(`${message.author}, Sana DM'den Hesabı Attım`);

      // Remove the sent line from the array
      lines.shift(); // Remove the first element (sent line)

      // Write the remaining lines back to the file
      const remainingLines = lines.join('\n');
      fs.writeFileSync('valorantacc.txt', remainingLines); // Write back to valorantacc.txt

      // Add user to cooldown
      cooldowns.add(message.author.id);
      setTimeout(() => {
        cooldowns.delete(message.author.id);
      }, 3600000); // 1 saat (3600000 ms)

    } catch (err) {
      console.error('Error reading file:', err);
      await message.channel.send('Error reading text file.');
    }
  }
});

// Event: Bot is ready
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Start the Express server
app.listen(port, () => {
  console.log(`Web panel running at http://localhost:${port}`);
});

// Login to Discord with your app's token
client.login(TOKEN);
