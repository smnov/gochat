package user

import (
	"net/http"

	"github.com/labstack/echo"
)

type Handler struct {
	Service
}

func NewHandler(s Service) *Handler {
	return &Handler{
		Service: s,
	}
}

func (h *Handler) CreateUser(c echo.Context) error {
	var u CreateUserReq
	if err := c.Bind(&u); err != nil {
		c.JSON(http.StatusBadRequest, err.Error())
		return err
	}
	res, err := h.Service.CreateUser(c.Request().Context(), &u)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err.Error())
		return err
	}

	c.JSON(http.StatusOK, res)
	return nil
}

func (h *Handler) Login(c echo.Context) error {
	var u LoginUserReq
	if err := c.Bind(&u); err != nil {
		c.JSON(http.StatusBadRequest, err.Error())
		return err
	}

	user, err := h.Service.Login(c.Request().Context(), &u)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err.Error())
		return err
	}

	cookie := http.Cookie{
		Name:     "jwt",
		Value:    user.accessToken,
		MaxAge:   3600,
		Path:     "/",
		Domain:   "localhost",
		Secure:   false,
		HttpOnly: true,
	}

	c.SetCookie(&cookie)

	res := &LoginUserResp{
		Username: user.Username,
		ID:       user.ID,
	}

	c.JSON(http.StatusOK, res)
	return nil
}

func (h *Handler) Logout(c echo.Context) error {
	cookie := http.Cookie{
		Name:     "jwt",
		Value:    "",
		MaxAge:   -1,
		Path:     "",
		Domain:   "",
		Secure:   false,
		HttpOnly: true,
	}
	c.SetCookie(&cookie)
	c.JSON(http.StatusOK, "Logout successful")
	return nil
}
