'use strict'

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const P = require('bluebird')
const Proxyquire = require('proxyquire')

Test('migrations', migrationsTest => {
  let sandbox
  let knexStub
  let knexConnStub
  let Migrator

  migrationsTest.beforeEach(t => {
    sandbox = Sinon.sandbox.create()

    knexConnStub = sandbox.stub()
    knexStub = sandbox.stub().returns(knexConnStub)

    Migrator = Proxyquire('../../src/migrations', { knex: knexStub })

    t.end()
  })

  migrationsTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  migrationsTest.test('migrate should', migrateTest => {
    migrateTest.test('run migrations and destroy Knex connection on completion', test => {
      let latestStub = sandbox.stub().returns(P.resolve(null))
      let seedStub = sandbox.stub().returns(P.resolve(null))
      let destroyStub = sandbox.stub().returns(P.resolve(null))
      knexConnStub.migrate = { latest: latestStub }
      knexConnStub.seed = { run: seedStub }
      knexConnStub.destroy = destroyStub

      let config = { migrations: { directory: 'test' } }

      Migrator.migrate(config)
        .then(() => {
          test.ok(knexStub.calledWith(config))
          test.ok(latestStub.calledOnce)
          test.ok(seedStub.calledOnce)
          test.ok(destroyStub.calledOnce)
          test.ok(seedStub.calledAfter(latestStub))
          test.ok(destroyStub.calledAfter(seedStub))
          test.end()
        })
    })

    migrateTest.end()
  })

  migrationsTest.end()
})
