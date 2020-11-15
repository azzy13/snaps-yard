import React, { useState, useEffect } from 'react';
import './App.css';
import Post from './Post';
import { db, auth } from './firebase';
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Input } from '@material-ui/core';
import ImageUpload from './ImageUpload';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {
  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);

  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  // listen to authentication change
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // user has logged in...

        setUser(authUser);
      } else {
        //user has logged out...
        setUser(null);
      }
    });

    return () => {
      //perform some 🔃
      unsubscribe();
    };
  }, [user, username]);

  //getting posts from firebase
  useEffect(() => {
    db.collection('posts').onSnapshot((snapshot) => {
      setPosts(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          post: doc.data(),
        })),
      );
    });
  }, [posts]);

  const signUp = (e) => {
    e.preventDefault();
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: username,
        });
      })
      .catch((err) => alert(err.message));
    setOpen(false);
    setEmail('');
    setPassword('');
    setUsername('');
  };

  const signIn = (e) => {
    e.preventDefault();
    auth
      .signInWithEmailAndPassword(email, password)
      .catch((err) => alert(err.message));
    setOpenSignIn(false);
    setPassword('');
    setUsername('');
  };

  return (
    <div className='app'>
      {user?.displayName ? (
        <ImageUpload username={user.displayName} />
      ) : (
        <h3>Sorry, you need to Login to upload</h3>
      )}

      <Modal open={open} onClose={() => setOpen(false)}>
        <div style={modalStyle} className={classes.paper}>
          <form className='app__signUp'>
            <center>
              <img
                className='app__headerImage'
                src='https://dewey.tailorbrands.com/production/brand_version_mockup_image/839/4037480839_98239a3f-c15c-4473-883c-7dcf3b4b7b79.png?cb=1604238923'
                alt='logo'
              />
            </center>

            <Input
              placeholder='username'
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <Input
              placeholder='email'
              type='text'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              placeholder='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button onClick={signUp}>Sign Up</Button>
          </form>
        </div>
      </Modal>

      <Modal open={openSignIn} onClose={() => setOpenSignIn(false)}>
        <div style={modalStyle} className={classes.paper}>
          <form className='app__signUp'>
            <center>
              <img
                className='app__headerImage'
                src='https://dewey.tailorbrands.com/production/brand_version_mockup_image/839/4037480839_98239a3f-c15c-4473-883c-7dcf3b4b7b79.png?cb=1604238923'
                alt='logo'
              />
            </center>

            <Input
              placeholder='email'
              type='text'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              placeholder='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button onClick={signIn}>Sign In</Button>
          </form>
        </div>
      </Modal>

      <div className='app__header'>
        <img
          className='app__headerImage'
          src='https://dewey.tailorbrands.com/production/brand_version_mockup_image/839/4037480839_98239a3f-c15c-4473-883c-7dcf3b4b7b79.png?cb=1604238923'
          alt='logo'
        />

        {user ? (
          <Button className='btn' onClick={() => auth.signOut()}>
            Logout
          </Button>
        ) : (
          <div className='app__loginContainer'>
            <Button className='btn' onClick={() => setOpenSignIn(true)}>
              Sign In
            </Button>
            <Button className='btn' onClick={() => setOpen(true)}>
              Sign up
            </Button>
          </div>
        )}
      </div>

      {posts.map(({ id, post }) => (
        <Post
          key={id}
          username={post.username}
          imageUrl={post.imageUrl}
          caption={post.caption}
        />
      ))}
    </div>
  );
}

export default App;
