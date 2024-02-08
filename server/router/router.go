package router

import (
	"server/internal/user"

	"github.com/labstack/echo"
)

var e *echo.Echo

func InitRouter(userHandler *user.Handler) {
	e = echo.New()
	e.POST("/signup", userHandler.CreateUser)
	e.POST("/login", userHandler.Login)
	e.GET("/logout", userHandler.Logout)
}

func Start(addr string) error {
	return e.Start(addr)
}
