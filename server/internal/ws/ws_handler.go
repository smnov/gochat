package ws

import (
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo"
)

type Handler struct {
	hub *Hub
}

func NewHandler(h *Hub) *Handler {
	return &Handler{
		hub: h,
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
	var req CreateRoomReq
	if err := c.Bind(&req); err != nil {
		c.JSON(http.StatusBadRequest, err.Error())
		return err
	}

	h.hub.Rooms[req.ID] = &Room{
		ID:      req.ID,
		Name:    req.Name,
		Clients: make(map[string]*Client),
	}

	c.JSON(http.StatusOK, req)
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
		Content:  "A new user has joined the room",
		RoomID:   roomId,
		Username: username,
	}

	h.hub.Register <- cl
	h.hub.Broadcast <- m
	go cl.writeMessage()
	cl.readMessage(h.hub)
	return nil
}

type RoomRes struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (h *Handler) GetRooms(c echo.Context) error {
	rooms := make([]RoomRes, 0)

	for _, r := range h.hub.Rooms {
		rooms = append(rooms, RoomRes{
			ID:   r.ID,
			Name: r.Name,
		})
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
