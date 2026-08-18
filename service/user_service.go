package service

import (
	"database/sql"
	"errors"
	"gopost/models"
	"gopost/repository"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	repo repository.UserRepository
}

func NewService(repo repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (r *UserService) CreateUser(user models.User) (string, error) {
	if _, err := r.repo.UserExist(user.Username); err != sql.ErrNoRows {
		return "", errors.New("User already exist.")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	user.Password = string(hash)

	if _, err := r.repo.CreateUser(user); err != nil {
		return "", nil
	}

	return user.Username, nil
}

func (r *UserService) GetUsers() ([]models.User, error) {
	getuser, err := r.repo.GetUsers()
	if err != nil {
		return nil, err
	}

	return getuser, nil
}

func (r *UserService) UpdateUser(user models.User, id, userid, role string) (sql.Result, error) {
	if userid != id {
		if role != "admin" {
			return nil, errors.New("User Unauthorized.")
		}
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user.Password = string(hash)

	result, err := r.repo.UpdateUser(user, id)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (r *UserService) DeleteUser(id, userid, role string) error {
	if userid != id {
		if role != "admin" {
			return errors.New("User Unauthorized.")
		}
	}

	if err := r.repo.DeleteUser(id); err != nil {
		return err
	}

	return nil
}

func (r *UserService) Login(user models.User) (string, string, error) {
	userdata, err := r.repo.UserExist(user.Username)
	if err == sql.ErrNoRows {
		return "", "", errors.New("User does not exist.")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(userdata.Password), []byte(user.Password)); err != nil {
		return "", "", errors.New("Alas, Incorrect password.")
	}

	token, err := GenerateJwt(userdata)
	if err != nil {
		return "", "", err
	}

	refresh_token, err := r.CreateRefreshToken(userdata)
	if err != nil {
		return "", "", err
	}

	return token, refresh_token, nil
}

func (s *UserService) CreateRefreshToken(user models.User) (string, error) {
	var refreshToken models.Refresh_Tokens

	tokenExist, err := s.repo.GetToken(user.ID.String())
	if err != sql.ErrNoRows {
		return tokenExist.Token, nil
	}

	token, err := GenerateRefreshToken()
	if err != nil {
		return "", err
	}

	refreshToken.Userid = user.ID.String()
	refreshToken.Token = token
	refreshToken.ExpiresAt = time.Now().Add(30 * 24 * time.Hour)

	if _, err := s.repo.RefreshToken(refreshToken); err != nil {
		return "", err
	}

	return token, nil

}

func (s *UserService) RefreshToken(token string) (string, error) {
	tokenExist, err := s.repo.GetToken(token)
	if err == sql.ErrNoRows {
		return "", errors.New("Token does not exist.")
	}

	user, err := s.repo.UserExist(tokenExist.Userid)
	if err != nil {
		return "", nil
	}

	jwtToken, err := GenerateJwt(user)
	if err != nil {
		return "", nil
	}

	return jwtToken, nil
}
