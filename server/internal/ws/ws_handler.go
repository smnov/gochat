package ws

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo"
	"github.com/redis/go-redis/v9"
)

type Handler struct {
	hub   *Hub
	redis *redis.Client
}

func NewHandler(h *Hub, r *redis.Client) *Handler {
	return &Handler{
		hub:   h,
		redis: r,
	}
}

type CreateRoomReq struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type GetRoomsReq struct {
	Rooms []Room
}

func (h *Handler) CreateRoom(c echo.Context) error {
	req := CreateRoomReq{}
	ctx := context.Background()
	if err := c.Bind(&req); err != nil {
		fmt.Printf("error: %v\n", err.Error())
		c.JSON(http.StatusBadRequest, err.Error())
		return err
	}

	h.hub.Rooms[req.ID] = &Room{
		ID:      req.ID,
		Name:    req.Name,
		Clients: make(map[string]*Client),
	}

	err := h.redis.RPush(ctx, req.ID, req.Name).Err()
	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusBadRequest, err.Error())
		return nil
	}
	c.JSON(http.StatusOK, req)
	return nil
}

func (h *Handler) DeleteRoom(c echo.Context) error {
	roomId := c.Param("roomId")
	ctx := context.Background()
	_, err := h.redis.Del(ctx, roomId).Result()
	if err != nil {
		return err
	}
	delete(h.hub.Rooms, roomId)
	return nil
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *Handler) JoinRoom(c echo.Context) error {
	conn, err := upgrader.Upgrade(c.Response().Writer, c.Request(), nil)
	if err != nil {
		c.JSON(http.StatusBadRequest, err.Error())
		return err
	}

	roomId := c.Param("roomId")
	clientId := c.QueryParam("userId")
	username := c.QueryParam("username")

	cl := &Client{
		Conn:     *conn,
		Message:  make(chan *Message, 10),
		ID:       clientId,
		RoomID:   roomId,
		Username: username,
	}

	m := &Message{
		Content:   "A new user has joined the room",
		RoomID:    roomId,
		Username:  username,
		CreatedAt: time.Now(),
	}
	h.hub.Register <- cl
	h.hub.Broadcast <- m
	go cl.writeMessage(h.redis)
	go cl.readMessage(h.hub)
	return nil
}

type RoomRes struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (h *Handler) GetMessages(c echo.Context) error {
	ctx := context.Background()
	roomId := c.Param("roomId")
	var messages []Message
	history, err := h.redis.LRange(ctx, roomId, 1, -1).Result()
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return err
	}
	for _, val := range history {
		var msg Message
		err = json.Unmarshal([]byte(val), &msg)
		if err != nil {
			c.JSON(http.StatusInternalServerError, err)
			return err
		}
		messages = append(messages, msg)
	}
	c.JSON(http.StatusOK, messages)
	return nil
}

func (h *Handler) GetRooms(c echo.Context) error {
	rooms := make([]RoomRes, 0)

	ctx := context.Background()

	var cursor uint64
	for {
		redisRooms, nextCursor, err := h.redis.Scan(ctx, cursor, "*", 10).Result()
		if err != nil {
			c.JSON(http.StatusInternalServerError, err.Error())
			return err
		}
		for _, roomID := range redisRooms {
			_, found := h.hub.Rooms[roomID]
			if !found {
				roomName, err := h.redis.LRange(ctx, roomID, 0, 0).Result()
				room := &Room{
					ID:   roomID,
					Name: strings.Join(roomName, ""),
				}
				room.Clients = make(map[string]*Client)
				h.hub.Rooms[roomID] = room
				if err != nil {
					c.JSON(http.StatusInternalServerError, err.Error())
					return err
				}
				rooms = append(rooms, RoomRes{
					ID:   roomID,
					Name: strings.Join(roomName, ""),
				})
			} else {
				rooms = append(rooms, RoomRes{
					ID:   h.hub.Rooms[roomID].ID,
					Name: h.hub.Rooms[roomID].Name,
				})
			}
		}
		cursor = nextCursor

		if cursor == 0 {
			break
		}
	}
	c.JSON(http.StatusOK, rooms)
	return nil
}

type ClientsRes struct {
	ID       string `json:"id"`
	Username string `json:"username"`
}

func (h *Handler) GetClients(c echo.Context) error {
	var clients []ClientsRes
	roomId := c.Param("roomId")
	if _, ok := h.hub.Rooms[roomId]; !ok {
		clients = make([]ClientsRes, 0) // if no rooms return empty ClientsRes
		c.JSON(http.StatusOK, clients)
		return nil
	}

	for _, c := range h.hub.Rooms[roomId].Clients {
		clients = append(clients, ClientsRes{
			ID:       c.ID,
			Username: c.Username,
		})
	}
	c.JSON(http.StatusOK, clients)
	return nil
}
