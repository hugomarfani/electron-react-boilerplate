import React, { JSX, useEffect, useState } from 'react';
import colors from '../../theme/colors';

type SongCardProps = {
  uri: string;
  onSelect: (uri: string) => void;
  accessToken: string;
};

function SongCard({ uri, onSelect, accessToken }: SongCardProps): JSX.Element {
  const [songDetails, setSongDetails] = useState<{
    title: string;
    artist: string;
    albumArt: string;
    status: 'Blue' | 'Green' | 'Yellow' | 'Red';
  } | null>(null);

  useEffect(() => {
    async function fetchSongDetails() {
      const trackId = uri.split(':').pop(); // Extract the track ID from the URI
      const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (data && data.artists && data.artists.length > 0 && data.album && data.album.images && data.album.images.length > 0) {
        setSongDetails({
          title: data.name,
          artist: data.artists[0].name,
          albumArt: data.album.images[0].url,
          status: 'Green', // Assuming status is 'Green' for now
        });
      } else {
        console.error('Invalid song data', data);
      }
    }
    fetchSongDetails();
  }, [uri, accessToken]);

  if (!songDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div
      onClick={() => onSelect(uri)}
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: colors.grey5,
        padding: '1rem',
        borderRadius: '24px',
        width: '200px', // Fixed width
        height: '48px', // Fixed height
        margin: '0 auto 1rem',
        overflow: 'hidden', // Ensures no content overflows the card boundaries
        cursor: 'pointer',
      }}
    >
      {/* Album Art */}
      <img
        src={songDetails.albumArt}
        alt={songDetails.title}
        style={{
          borderRadius: '8px',
          width: '48px',
          height: '48px',
          objectFit: 'cover',
        }}
      />
      {/* Song Details */}
      <div style={{ flex: 1, marginLeft: '1rem', overflow: 'hidden' }}>
        <h2
          style={{
            fontSize: '1rem',
            margin: '0 0 0.25rem',
            fontWeight: 'bold',
            color: '#000',
            whiteSpace: 'nowrap', // Prevents text wrapping
            overflow: 'hidden', // Hides overflowing text
            textOverflow: 'ellipsis', // Adds "..." for truncated text
          }}
        >
          {songDetails.title}
        </h2>
        <p
          style={{
            fontSize: '0.875rem',
            margin: 0,
            color: '#6B7280', // Grey tone
            whiteSpace: 'nowrap', // Prevents text wrapping
            overflow: 'hidden', // Hides overflowing text
            textOverflow: 'ellipsis', // Adds "..." for truncated text
          }}
        >
          {songDetails.artist}
        </p>
      </div>
      {/* Status Indicator */}
      <div>
        <span
          style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: colors[songDetails.status.toLowerCase()],
          }}
        />
      </div>
    </div>
  );
}

export default SongCard;
