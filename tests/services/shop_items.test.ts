import { ShopItemsService } from '../../src/shop_items/shop_items.database.service'
import { ShopsServices } from '../../src/shops/shops.database.service'
import { shop } from '../common/models'
import { Sequelize } from 'sequelize-typescript'
import { intoSequelizeOption } from '../../src/commons/services/orm/config.service'
import { config } from '../common/config'
import ShopItem from '../../src/commons/services/orm/models/shop_items.database.model'
import { Order, SortBy } from '../../src/shop_items/models/shop_items.model'
import { ShopItemCreationModel } from '../../src/shop_items/models/shop_items.model'

const shop_items: Array<ShopItemCreationModel> = [
  {
    name: 'kidney',
    price: 3,
  },
  {
    name: 'lung',
    price: 40,
  },
  {
    name: 'leg',
    price: 450,
  },
]

describe('Shop item domain', () => {
  it('should be able to create a shop item', async () => {
    const sequelize = new Sequelize(intoSequelizeOption(config))
    const t = await sequelize.transaction()

    const shop_id = (
      await ShopsServices.createShop(shop.name, shop.phone, shop.address, shop.zipcode, t)
    )._unsafeUnwrap().id
    const shop_item_sample = shop_items[0]

    const res = await ShopItemsService.createShopItem(shop_id, shop_item_sample.name, shop_item_sample.price, t)
    expect(res.isOk()).toBeTruthy()
    const created_si_id = res._unsafeUnwrap().id
    const retrieve_si = await ShopItem.findOne({ where: { id: created_si_id }, transaction: t })

    expect(retrieve_si).not.toBeNull()
    if (retrieve_si != null) {
      expect(retrieve_si.name).toBe(shop_item_sample.name)
      expect(retrieve_si.price).toBe(shop_item_sample.price)
      expect(retrieve_si.shop_id).toBe(shop_id)
      expect(retrieve_si.id).toBe(created_si_id)
    }

    await t.rollback()
  })

  it('should be able to create shop items', async () => {
    const sequelize = new Sequelize(intoSequelizeOption(config))
    const t = await sequelize.transaction()

    const shop_id = (
      await ShopsServices.createShop(shop.name, shop.phone, shop.address, shop.zipcode, t)
    )._unsafeUnwrap().id

    const res = await ShopItemsService.createShopItems(shop_id, shop_items, t)
    expect(res.isOk()).toBeTruthy()
    const created_items = await ShopItem.findAll({ raw: true, transaction: t })
    for (let i = 0; i < shop_items.length; i++) {
      expect(created_items[i].shop_id).toBe(shop_id)
      expect(created_items[i].name).toBe(shop_items[i].name)
      expect(created_items[i].price).toBe(shop_items[i].price)
    }

    await t.rollback()
  })

  it('should be able to retrieve a shop item from and id', async () => {
    const sequelize = new Sequelize(intoSequelizeOption(config))
    const t = await sequelize.transaction()

    const shop_id = (
      await ShopsServices.createShop(shop.name, shop.phone, shop.address, shop.zipcode, t)
    )._unsafeUnwrap().id

    let res = await ShopItemsService.createShopItem(shop_id, shop_items[0].name, shop_items[0].price, t)
    expect(res.isOk()).toBeTruthy()
    const created_item = res._unsafeUnwrap()
    res = await ShopItemsService.retrieveShopItemFromId(created_item.id, t)
    expect(res.isOk()).toBeTruthy()
    const retrieved_item = res._unsafeUnwrap()

    expect(retrieved_item.id).toBe(created_item.id)
    await t.rollback()
  })

  describe('should be able to retrieve shop items with a given filter', () => {
    const params = [
      [
        {
          page: 1,
          nb_items: 3,
          sort_by: SortBy.NAME,
          order: Order.ASC,
          query: '',
          expected_si: [shop_items[0], shop_items[2], shop_items[1]],
        },
      ],
      [{ page: 2, nb_items: 1, sort_by: SortBy.NAME, order: Order.DESC, query: '', expected_si: [shop_items[2]] }],
      [{ page: 1, nb_items: 1, sort_by: SortBy.NAME, order: Order.ASC, query: '', expected_si: [shop_items[0]] }],
      [
        {
          page: 1,
          nb_items: 2,
          sort_by: SortBy.PRICE,
          order: Order.DESC,
          query: '',
          expected_si: [shop_items[2], shop_items[1]],
        },
      ],
      [
        {
          page: 1,
          nb_items: 2,
          sort_by: SortBy.NAME,
          order: Order.ASC,
          query: 'l',
          expected_si: [shop_items[2], shop_items[1]],
        },
      ],
    ]

    it.each(params)('Test n%#', async (param) => {
      const { page, nb_items, sort_by, order, query, expected_si } = param

      const sequelize = new Sequelize(intoSequelizeOption(config))
      const t = await sequelize.transaction()

      const shop_id = (
        await ShopsServices.createShop(shop.name, shop.phone, shop.address, shop.zipcode, t)
      )._unsafeUnwrap().id

      const res = await ShopItemsService.createShopItems(shop_id, shop_items, t)
      expect(res.isOk()).toBeTruthy()
      const res_items = await ShopItemsService.retrieveShopItemPage(shop_id, page, nb_items, sort_by, order, query, t)

      expect(res_items.isOk()).toBeTruthy()
      const paged_items = res_items._unsafeUnwrap()

      expect(paged_items.length).toBe(expected_si.length)
      for (let i = 0; i < paged_items.length; i++) {
        expect(paged_items[i].name).toBe(expected_si[i].name)
      }

      await t.rollback()
    })
  })
})
