// Definindo constantes e variáveis iniciais
const maxPokemonNumber = 649; // O número máximo de Pokémon
let offset = 0; // Deslocamento para controlar quais Pokémon já foram carregados
let windowHeight = window.innerHeight; // Altura da janela do navegador
let documentHeight = document.body.scrollHeight; // Altura total do documento
let loading = false; // Indica se uma solicitação de carregamento está em andamento
const loadLimit = 33; // Carregar mais 10 Pokémon de cada vez (ajuste conforme necessário)
const urlBase = 'https://pokeapi.co/api/v2/pokemon/'; // URL base da API

// Função para converter os tipos em uma lista ordenada
function convertTypes(types) {
    return types.map(type => `<li class="type">${type.type.name}</li>`).join('');
}

// Função para converter um Pokémon em HTML
function convertPokemon(pokemon) {
    const types = convertTypes(pokemon.types);

    const pokemonType = pokemon.types[0].type.name; // Obtém o tipo principal do Pokémon
    const backgroundColorClass = `bg-${pokemonType}`; // Cria uma classe de fundo com base no tipo

    return `
    <li class="pokemon ${backgroundColorClass}">
        <span class="number">#${pokemon.id.toString().padStart(3, '0')}</span>
        <span class="name">${pokemon.name}</span>
        <div class="details">
            <ol class="types">
                ${types}
            </ol>
            <img
                src="${pokemon.sprites.other['dream_world'].front_default}"
                alt="${pokemon.name}"
            />
        </div>
    </li>
    `;
}

// Função para carregar os Pokémon
function loadPokemons() {
    if (!loading && offset < maxPokemonNumber) {
        loading = true; // Marca que uma solicitação está em andamento

        const remainingPokemon = maxPokemonNumber - offset;
        const numToLoad = Math.min(remainingPokemon, loadLimit);

        fetch(`${urlBase}?offset=${offset}&limit=${numToLoad}`)
            .then(response => response.json())
            .then(data => {
                const promises = data.results.map(pokemon => 
                    fetch(pokemon.url).then(response => response.json())
                );
                return Promise.all(promises);
            })
            .then(pokemonsData => {
                const pokemonElements = pokemonsData.map(convertPokemon).join('');
                const pokemonsContainer = document.querySelector('.pokemons');
                pokemonsContainer.insertAdjacentHTML('beforeend', pokemonElements);
                offset += numToLoad; // Atualiza o offset para carregar os próximos Pokémon
                loading = false; // Marca que a solicitação foi concluída
            })
            .catch(error => {
                console.error(error);
                loading = false; // Marca que a solicitação foi concluída (mesmo em caso de erro)
            });
    }
}

// Função para atualizar os valores de dimensão da janela
function updateWindowDimensions() {
    windowHeight = window.innerHeight;
    documentHeight = document.body.scrollHeight;
}

// Função para carregar mais Pokémon quando a barra de rolagem chegar ao final
function handleScroll() {
    const scrollPosition = window.scrollY;

    // Verifica se a posição de rolagem está próxima ao final da página
    if (scrollPosition + windowHeight >= documentHeight) {
        loadPokemons(); // Carrega mais Pokémon
    }
}

// Adiciona um ouvinte de evento de rolagem para chamar handleScroll
window.addEventListener('scroll', handleScroll);

// Atualiza as dimensões da janela quando a orientação da tela muda
window.addEventListener('orientationchange', updateWindowDimensions);

// Carrega os primeiros 10 Pokémon ao carregar a página
updateWindowDimensions(); // Inicializa as dimensões da janela
loadPokemons();
