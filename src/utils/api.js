export var CHARACTER_QUERY = `
query ($search: String, $page: Int, $perPage: Int) {
  Page (page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    characters (search: $search) {
      id
      name { full }
    }
  }
}
`;

export var VA_QUERY = `      
query ($id: Int) {
  Character(id: $id) {
    id
    name { full }
    media {
      edges {
        node {
          id
          title {
            romaji
          }
          coverImage { large }
        }
        characterRole
        voiceActors(language: JAPANESE) {
          name { full }
          id
        }
      }
    }
  }    
}
`;

export var ENTRY_QUERY = `
query ($id: Int) {
  Staff (id: $id) {
    name { first last }
    image {
      large
    }
    description (asHtml: true)
    characters {
      pageInfo {
        currentPage
        lastPage
        hasNextPage
      }
      edges {
        node {
          name { first last }
          image { medium }
          favourites
          siteUrl
        }
        role
        media {
          title { romaji }
          popularity
        }
      }
      
    }
  }
}
`;

export var ADDITIONAL_ENTRY_QUERY = `
query ($id: Int, $page: Int) {
  Staff (id: $id) {
    characters (page: $page) {
      pageInfo {
        currentPage
        lastPage
        hasNextPage
      }
      edges {
        node {
          name { first last }
          image { medium }
          favourites
          siteUrl
        }
        role
        media {
          title { romaji }
          popularity
        }
      }
      
    }
  }
}`;

export var FUN_FACT_QUERY = `
{
  Page (page: 1, perPage: 50) {
    pageInfo { total }
    staff(sort: FAVOURITES_DESC) {
      name{ full }
      id
      characters(page: 1, perPage: 15, sort: FAVOURITES_DESC) {
        nodes {
          name { full }
          media (sort: POPULARITY_DESC) {
            nodes {
              title { romaji }
            }
          }
        }
      }
    }
  }
}`;




export function prepareFetch(query, variables) {
    // Define the config we'll need for our Api request
    var url = 'https://graphql.anilist.co',
      options = {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
          },
          body: JSON.stringify({
              query: query,
              variables: variables
          })
      };

    return [url, options];
}

export function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

export function handleData(data) {
  // console.log(data);
}

export function handleError(error) {
    alert('An unknown error has occured. Please try again with another character!');
    console.error(error);
}