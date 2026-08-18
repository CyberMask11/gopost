package service

import (
	"crypto/rand"
	"encoding/hex"
	"gopost/models"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateJwt(user models.User) (string, error) {
	payload := jwt.MapClaims{
		"id":       user.ID,
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(15 * time.Minute).Unix()}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, payload)

	tokenSigned, err := token.SignedString([]byte(os.Getenv("SECRET")))
	if err != nil {
		return "", err
	}

	return tokenSigned, nil
}

func GenerateRefreshToken() (string, error) {
	key := make([]byte, 32)

	if _, err := rand.Read(key); err != nil {
		return "", err
	}

	return hex.EncodeToString(key), nil
}
