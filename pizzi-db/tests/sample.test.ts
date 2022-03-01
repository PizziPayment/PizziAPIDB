import ConfigProvider from 'config'

const config = {
    host: ConfigProvider.get('host'),
    port: ConfigProvider.get('port'),
    name: ConfigProvider.get('name'),
    user: ConfigProvider.get('user'),
    password: ConfigProvider.get('password'),
}

describe('The test framework', () => {
    it('works', () => {
        expect(config.port).toEqual(5432)
    })
})
