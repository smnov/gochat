package router

import (
	"server/internal/user"
	"server/internal/ws"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

var e *echo.Echo

func InitRouter(userHandler *user.Handler, wsHandler *ws.Handler) {
	e = echo.New()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST"},
		AllowCredentials: true,
		MaxAge:           43200,
	}))
	e.POST("/signup", userHandler.CreateUser)
	e.POST("/login", userHandler.Login)
	e.GET("/logout", userHandler.Logout)

	e.POST("/ws/createRoom", wsHandler.CreateRoom)
	e.GET("/ws/joinRoom/:roomId", wsHandler.JoinRoom)
	e.GET("/ws/getRooms", wsHandler.GetRooms)
	e.GET("/ws/getClients/:roomId", wsHandler.GetClients)
}

func Start(addr string) error {
	return e.Start(addr)
}
