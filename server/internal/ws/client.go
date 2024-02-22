package ws

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

type Client struct {
	Conn     websocket.Conn
	Message  chan *Message
	ID       string `json:"id"`
	RoomID   string `json:"roomId"`
	Username string `json:"username"`
}

type Message struct {
	Content   string    `json:"content" redis:"content"`
	RoomID    string    `json:"roomId" redis:"roomId"`
	Username  string    `json:"username" redis:"username"`
	CreatedAt time.Time `json:"createdAt" redis:"createdAt"`
}

func (c *Client) writeMessage(r *redis.Client) {
	defer func() {
		c.Conn.Close()
	}()

	for {
		message, ok := <-c.Message
		if !ok {
			return
		}
		ctx := context.Background()
		msg, err := json.Marshal(message)
		if err != nil {
			fmt.Errorf("cannot marshal message: %s", err.Error())
		}
		msg_redis := r.LPush(ctx, message.RoomID, msg)
		fmt.Println(msg_redis)
		c.Conn.WriteJSON(message)
	}
}

func (c *Client) readMessage(hub *Hub) {
	defer func() {
		hub.Unregister <- c
		c.Conn.Close()
	}()

	for {
		_, m, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		msg := &Message{
			Content:  string(m),
			RoomID:   c.RoomID,
			Username: c.Username,
		}
		hub.Broadcast <- msg
	}
}
