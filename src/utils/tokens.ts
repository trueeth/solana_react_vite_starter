export interface IToken {
    name: string,
    symbol: string,
    logo: string,
    address?: string
}


export const TokenList: Array<IToken> = [
    {
        name: 'SOL',
        symbol: 'SOL',
        logo: '/assets/solana-sol-logo.png',
        address: ""
    },
    {
        name: 'USDT',
        symbol: 'USDT',
        logo: '/assets/tether-usdt-logo.png',
        address: "BHyC1j4XXzgiTEzQM6wJP7nVLrsQiUeDNCTXs3Nwzvay"
    },
    {
        name: 'BONK',
        symbol: '$BONK',
        logo: '/assets/bonk-logo.png',
        address: "8Tc5q5jzZa2jWGsJSZ8NBvEdNw7siR7tavgKwJdje35w"
    }
]