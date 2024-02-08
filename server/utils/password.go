package utils

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password", err)
	}

	return string(hashedPassword), nil
}

func CheckPassword(password, hashPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(password), []byte(hashPassword))
}
